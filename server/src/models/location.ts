import dynamoose from 'dynamoose';
import defaultModelConfig from '../util/modelConfig';

export enum Tag {
  EAST = 'east',
  CENTRAL = 'central',
  NORTH = 'north',
  WEST = 'west',
  CTOWN = 'ctown',
  DTOWN = 'dtown',
  INACTIVE = 'inactive',
  CUSTOM = 'custom',
}

export type LocationType = {
  id: string;
  name: string;
  address: string;
  shortName: string;
  info?: string;
  tag: Tag;
  lat: number;
  lng: number;
  photoLink?: string;
};

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
    // required: true,
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
});

export const Location = dynamoose.model(
  'Locations',
  schema,
  defaultModelConfig
);
