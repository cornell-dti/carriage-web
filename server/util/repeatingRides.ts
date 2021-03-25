import { v4 as uuid } from 'uuid';
import moment from 'moment';
import { Condition } from 'dynamoose';
import schedule from 'node-schedule';
import { AnyDocument } from 'dynamoose/dist/Document';
import { Ride, RideType } from '../models/ride';

// run function at 10:05:00am every day
schedule.scheduleJob('00 05 10 * * *', () => {
  createRepeatingRides();
});

function createRepeatingRides() {
  let tomorrowDate = moment(new Date());
  tomorrowDate = tomorrowDate.add(1, 'days');
  const tomorrowDateString = tomorrowDate.format('MM/DD/YYYY');

  const tomorrowDay = tomorrowDate.weekday();

  // condition: recurring ride that includes tomorrowDay
  const condition = new Condition().where('recurring').eq(true)
    .and()
    .where('recurringDays')
    .contains(tomorrowDay);

  Ride.scan(condition).exec((_, data) => {
    data?.forEach(async (masterRide) => {
      const { rider, driver, startLocation, endLocation,
        endDate, edits } = masterRide as unknown as RideType;

      if (!endDate || (endDate > tomorrowDateString)) {
        // const tomorrowDateOnly = moment(new Date()).add(1, 'days').format('YYYY-MM-DD');
        const tomorrowDateOnly = moment(new Date()).format('YYYY-MM-DD');

        const newStartTimeOnly = moment(masterRide.startTime).format('HH:mm:ss');
        const newStartTime = moment(`${tomorrowDateOnly}T${newStartTimeOnly}`).toISOString();

        const newEndTimeOnly = moment(masterRide.requestedEndTime).format('HH:mm:ss');
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

        if (edits) {
          handleEdits(edits, tomorrowDateOnly, repeatingRide, masterRide);
        }
      }
    });
  });
}

function handleEdits(edits: string[], tomorrowDateOnly: string,
  repeatingRide: AnyDocument, masterRide: AnyDocument) {
  const seenEdits: string[] = [];
  let editCount = 0;
  const numEdits = edits.length;

  edits.forEach(async (editId) => {
    Ride.get(editId).then(async (editRide) => {
      const editDate = moment(editRide.startTime);
      const editDateOnly = moment(editDate).add(1, 'days').format('YYYY-MM-DD');

      // only look at edits that match tomorrow's date
      if (editDateOnly === tomorrowDateOnly) {
        seenEdits.push(editId);
        // if deleted = true
        if (editRide.deleted === true) {
          // create repeating ride only if it does NOT match the delete edit
          if (!(repeatingRide.startTime === editRide.startTime
            && repeatingRide.requestedEndTime === editRide.requestedEndTime
            && repeatingRide.rider.id === editRide.rider.id
            && repeatingRide.startLocation.id === editRide.startLocation.id
            && repeatingRide.endLocation.id === editRide.endLocation.id)) {
            repeatingRide.save();
          }
          // remove this delete edit
          Ride.get(editId).then((dataGetToDelete) => {
            dataGetToDelete?.delete();
          });
        }
        // if deleted = false, the instance is kept as a valid ride
      }
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
