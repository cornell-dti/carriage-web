import dynamoose from 'dynamoose';
import defaultModelConfig from '../util/modelConfig';

export enum Tag {
  EAST = 'east',
  WEST = 'west',
  CENTRAL = 'central',
  NORTH = 'north',
  CTOWN = 'ctown', // college town
  DTOWN = 'dtown', // downtown
  INACTIVE = 'inactive',
  CUSTOM = 'custom',
}

export type LocationType = {
  id: string;
  name: string;
  address: string;
  tag: Tag;
  info?: string;
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
  tag: {
    type: String,
    required: true,
    enum: Object.values(Tag),
  },
  info: {
    type: String,
    required: true,
  },
  photoLink: String,
});

export const Location = dynamoose.model(
  'Locations',
  schema,
  defaultModelConfig
);
