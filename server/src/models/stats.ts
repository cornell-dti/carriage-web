import dynamoose from 'dynamoose';
import defaultModelConfig from '../util/modelConfig';

export type StatsType = {
  year: string;
  monthDay: string;
  dayCount: number;
  dayNoShow: number;
  dayCancel: number;
  nightCount: number;
  nightNoShow: number;
  nightCancel: number;
  drivers: {
    [name: string]: number;
  };
};

const schema = new dynamoose.Schema(
  {
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
    drivers: {
      type: Object,
      required: true,
    },
  },
  { saveUnknown: ['drivers.*'] }
);

export const Stats = dynamoose.model('Stats', schema, defaultModelConfig);
