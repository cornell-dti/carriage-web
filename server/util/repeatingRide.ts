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

      // get startDate
      const startDate = moment(startTime).format('YYYY-MM-DD');

      // only continue if tomorrow is between the startDate and endDate
      if (endDate && endDate >= tomorrowDateOnly && startDate <= tomorrowDateOnly) {
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

        if (edits?.length) {
          handleEdits(edits, tomorrowDateOnly, repeatingRide, startDate, masterRide);
        } else if (tomorrowDateOnly !== startDate) {
          // create repeating ride if no edits and not first occurrence
          repeatingRide.save().catch((err) => console.log(err));
        }
      }
    });
  });
}

function handleEdits(
  edits: string[],
  tomorrowDateOnly: string,
  repeatingRide: AnyDocument,
  startDate: string,
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
      editCount += 1;
      if (editCount === numEdits) {
        // create repeating ride if no edits for tomorrow and not first occurrence
        if (seenEdits.length === 0) {
          if (tomorrowDateOnly !== startDate) {
            repeatingRide.save().catch((err) => console.log(err));
          }
        // otherwise, remove the seen edits from the master ride
        } else {
          const newEdits = await masterRide.edits.filter((id: string) => !(seenEdits.includes(id)));
          const operation = { $SET: { edits: newEdits } };
          const keyId = masterRide.id;
          Ride.update({ id: keyId }, operation);
        }
      }
    });
  });
}
