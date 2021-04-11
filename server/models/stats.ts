import dynamoose from 'dynamoose';

export type StatsType = {
  year: number,
  monthDay: number,
  dayCount: number,
  dayNoShow: number,
  dayCancel: number,
  nightCount: number,
  nightNoShow: number,
  nightCancel: number,
  dailyTotal: number
  drivers: Object,
};

const schema = new dynamoose.Schema({
  year: {
    type: String,
    required: true,
    hashKey: true,
  },
  monthDay: {
    type: String,
    required: true,
    rangeKey: true,
  },
  dayCount: {
    type: Number,
    required: true,
    default: 0,
  },
  dayNoShow: {
    type: Number,
    required: true,
    default: 0,
  },
  dayCancel: {
    type: Number,
    required: true,
    default: 0,
  },
  nightCount: {
    type: Number,
    required: true,
    default: 0,
  },
  nightNoShow: {
    type: Number,
    required: true,
    default: 0,
  },
  nightCancel: {
    type: Number,
    required: true,
    default: 0,
  },
  dailyTotal: {
    type: Number,
    required: true,
    default: 0,
  },
  drivers: {
    type: Object,
    required: true,
  },
}, { saveUnknown: ['drivers.*'] });

export const Stats = dynamoose.model('Stats', schema, { create: false });
