import dynamoose from 'dynamoose';
import defaultModelConfig from '../util/modelConfig';
import { Tag } from '@carriage-web/shared/src/types/location';

const schema = new dynamoose.Schema({
  id: {
    type: String,
    required: true,
    hashKey: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  info: {
    type: String,
  },
  shortName: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    required: true,
    enum: Object.values(Tag),
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  photoLink: {
    type: String,
  },
  images: {
    type: Array,
    schema: [String],
  },
});

export const Location = dynamoose.model(
  'Locations',
  schema,
  defaultModelConfig
);
