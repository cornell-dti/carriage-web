import { v4 as uuid } from 'uuid';
import moment from 'moment';
import { Condition } from 'dynamoose';
import schedule from 'node-schedule';
import { AnyDocument } from 'dynamoose/dist/Document';
import { Ride, RideType } from '../models/ride';

export default function initSchedule() {
// run function at 10:05:00am every day
  schedule.scheduleJob('0 5 10 * * *', () => {
    createRepeatingRides();
  });
}


function createRepeatingRides() {
  let tomorrowDate = moment(new Date());
  tomorrowDate = tomorrowDate.add(1, 'days');
  const tomorrowDateOnly = tomorrowDate.format('YYYY-MM-DD');

  const tomorrowDay = tomorrowDate.weekday();

  // condition: recurring ride that includes tomorrowDay
  const condition = new Condition()
    .where('recurring')
    .eq(true)
    .and()
    .where('recurringDays')
    .contains(tomorrowDay);

  Ride.scan(condition).exec((_, data) => {
    data?.forEach(async (masterRide) => {
      const {
        id, rider, driver, startLocation, endLocation, startTime, endTime, endDate, edits,
      } = masterRide.toJSON() as RideType;

      // change endDate format from MM/DD/YYYY to YYYY-MM-DD
      const endDateMoment = moment(endDate, 'MM/DD/YYYY');
      const endDateFormat = endDateMoment.format('YYYY-MM-DD');

      // get startDate
      const startDate = moment(startTime).format('YYYY-MM-DD');

      // only continue if tomorrow is between the startDate and endDate
      if (endDate && endDateFormat >= tomorrowDateOnly && startDate <= tomorrowDateOnly) {
        // if there are edits, don't create a repeating ride instance
        if (edits?.length) {
          handleEdits(edits, tomorrowDateOnly, masterRide);
        } else if (tomorrowDateOnly !== startDate) {
        // create a repeating ride instance if there are no edits and tomorrow
        // is not the first occurrence
          const newStartTimeOnly = moment(startTime).format('HH:mm:ss');
          const newStartTime = moment(`${tomorrowDateOnly}T${newStartTimeOnly}`).toISOString();

          const newEndTimeOnly = moment(endTime).format('HH:mm:ss');
          const newEndTime = moment(`${tomorrowDateOnly}T${newEndTimeOnly}`).toISOString();

          const repeatingRide = new Ride({
            id: uuid(),
            rider,
            startLocation,
            endLocation,
            startTime: newStartTime,
            requestedEndTime: newEndTime,
            endTime: newEndTime,
            driver,
            recurring: false,
          });
          repeatingRide.save().catch((err) => console.log(err));
        }
      }
    });
  });
}

function handleEdits(
  edits: string[],
  tomorrowDateOnly: string,
  masterRide: AnyDocument,
) {
  const seenEdits: string[] = [];
  let editCount = 0;
  const numEdits = edits.length;

  edits.forEach(async (editId) => {
    Ride.get(editId).then(async (editRide) => {
      const editDate = moment(editRide.startTime);
      const editDateOnly = moment(editDate).format('YYYY-MM-DD');

      // only look at edits that match tomorrow's date
      if (editDateOnly === tomorrowDateOnly) {
        seenEdits.push(editId);
        // if deleted = true, remove the edit instance
        if (editRide.deleted) {
          Ride.get(editId).then((dataGetToDelete) => {
            dataGetToDelete?.delete();
          });
        }
        // if deleted = false, keep the edit instance as a valid ride
      }
      // remove the seen edit ids from the master repeating ride's edits field
      editCount += 1;
      if (editCount === numEdits) {
        const newEdits = await masterRide.edits.filter((id: string) => !(seenEdits.includes(id)));
        const operation = { $SET: { edits: newEdits } };
        const keyId = masterRide.id;
        Ride.update({ id: keyId }, operation);
      }
    });
  });
}
