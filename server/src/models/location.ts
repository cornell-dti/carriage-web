import dynamoose from 'dynamoose';
import defaultModelConfig from '../util/modelConfig';

export enum Tag {
  EAST = 'East',
  WEST = 'West',
  CENTRAL = 'Central',
  NORTH = 'North',
  CTOWN = 'C-Town', // college town
  DTOWN = 'Downtown', // downtown
  INACTIVE = 'Inactive',
  CUSTOM = 'Custom',
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
});

export const Location = dynamoose.model(
  'Locations',
  schema,
  defaultModelConfig
);
