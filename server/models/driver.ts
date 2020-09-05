import dynamoose from 'dynamoose';

type BreakTimes = {
  breakStart: string,
  breakEnd: string,
}

type BreakType = {
  Mon?: BreakTimes,
  Tue?: BreakTimes,
  Wed?: BreakTimes,
  Thu?: BreakTimes,
  Fri?: BreakTimes,
}

export type DriverType = {
  id: string,
  firstName: string,
  lastName: string,
  startTime: string,
  endTime: string,
  breaks: BreakType,
  vehicle: string,
  phoneNumber: string,
  email: string,
};

const breakDayValue = {
  type: Object,
  schema: {
    breakStart: String,
    breakEnd: String,
  },
};

const breakSchema = {
  Mon: breakDayValue,
  Tue: breakDayValue,
  Wed: breakDayValue,
  Thu: breakDayValue,
  Fri: breakDayValue,
};

const schema = new dynamoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
  startTime: String,
  endTime: String,
  breaks: {
    type: Object,
    schema: breakSchema,
  },
  vehicle: String,
  phoneNumber: String,
  email: String,
});

export const Driver = dynamoose.model('Drivers', schema, { create: false });
