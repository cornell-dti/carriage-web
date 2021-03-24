import { v4 as uuid } from 'uuid';
import moment from 'moment';
import { Condition } from 'dynamoose';
import schedule from 'node-schedule';
import { Ride, RideType } from '../models/ride';

// run function at 10:05:00 every day
schedule.scheduleJob('00 05 10 * * *', () => {
  createRepeatingRides();
});

function createRepeatingRides() {
  let tomorrowDate = moment(new Date());
  tomorrowDate = tomorrowDate.add(1, 'days');
  let tomorrowDateOnly = tomorrowDate.format('MM/DD/YYYY');

  const tomorrowDay = tomorrowDate.weekday();

  // condition: recurring ride that includes tomorrowDay
  const condition = new Condition().where('recurring').eq(true)
    .and()
    .where('recurringDays')
    .contains(tomorrowDay);

  Ride
    .scan(condition)
    .exec((_, data) => {
      data?.forEach((ride) => {
        const { rider, driver, startLocation, endLocation,
          endDate, edits } = ride as unknown as RideType;

        if (!endDate || (endDate > tomorrowDateOnly)) {
          tomorrowDateOnly = moment(tomorrowDateOnly).format('YYYY-MM-DD');

          const newStartTimeOnly = moment(ride.startTime).format('HH:mm:ss');
          const newStartTime = moment(`${tomorrowDateOnly}T${newStartTimeOnly}`).toISOString();

          const newEndTimeOnly = moment(ride.requestedEndTime).format('HH:mm:ss');
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
          repeatingRide.save();

          if (edits) {
            edits.forEach((editId) => {
              Ride.get(editId, (__, dataEdit) => {
                const editRide = dataEdit as unknown as RideType;
                const editDate = moment(editRide.startTime);
                const editDateOnly = moment(editDate).format('YYYY-MM-DD');

                // only look at edits that match tomorrow's date
                if (editDateOnly === tomorrowDateOnly) {
                  if (editRide.deleted === true) {
                    // find and remove the ride instance(s) that matches
                    // this deleted edit
                    const conditionToDelete = new Condition()
                      .where('recurring').eq(false)
                      .and()
                      .where('startTime')
                      .eq(editRide.startTime)
                      .and()
                      .where('requestedEndTime')
                      .eq(editRide.requestedEndTime)
                      .and()
                      .where('rider')
                      .eq(editRide.rider.id)
                      .and()
                      .where('startLocation')
                      .eq(editRide.startLocation.id)
                      .and()
                      .where('endLocation')
                      .eq(editRide.endLocation.id);

                    Ride
                      .scan(conditionToDelete)
                      .exec((___, dataDelete) => {
                      dataDelete?.forEach((dataToRemove) => {
                        const rideToRemove = dataToRemove as unknown as RideType;

                        Ride.get(rideToRemove.id, (____, dataGetToDelete) => {
                          dataGetToDelete?.delete();
                        });
                      });
                      });
                  }
                  // if deleted = false, this ride instance should be kept
                }
              });
            });
          }
        }
      });
    });
}
