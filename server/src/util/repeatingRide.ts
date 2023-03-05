import { v4 as uuid } from 'uuid';
import moment from 'moment';
import { Condition } from 'dynamoose';
import schedule from 'node-schedule';
import { Ride, RideType } from '../models/ride';

export default function initSchedule() {
  // run function at 10:05:00am every day
  schedule.scheduleJob('0 5 10 * * *', () => {
    createRepeatingRides();
  });
}

function createRepeatingRides() {
  const tomorrowDate = moment().add(1, 'days');
  const tomorrowDateOnly = tomorrowDate.format('YYYY-MM-DD');
  const tomorrowDay = tomorrowDate.weekday();

  const condition = new Condition()
    .where('recurring')
    .eq(true)
    .where('recurringDays')
    .contains(tomorrowDay)
    .where('startTime')
    .le(tomorrowDate.toISOString())
    .where('endDate')
    .ge(tomorrowDateOnly)
    .where('deleted')
    .not()
    .contains(tomorrowDateOnly);

  Ride.scan(condition).exec((_, data) => {
    data?.forEach((masterRide) => {
      const { rider, startLocation, endLocation, startTime, endTime } =
        masterRide.toJSON() as RideType;

      const newStartTimeOnly = moment(startTime).format('HH:mm:ss');
      const newStartTime = moment(
        `${tomorrowDateOnly}T${newStartTimeOnly}`
      ).toISOString();

      const newEndTimeOnly = moment(endTime).format('HH:mm:ss');
      const newEndTime = moment(
        `${tomorrowDateOnly}T${newEndTimeOnly}`
      ).toISOString();

      const ride = new Ride({
        id: uuid(),
        startTime: newStartTime,
        endTime: newEndTime,
        rider,
        startLocation: startLocation.id ?? startLocation,
        endLocation: endLocation.id ?? endLocation,
      });

      ride.save().catch((err) => console.log(err));
    });
  });
}
