import dynamoose from 'dynamoose';
import { formatAddress, isAddress } from '../util';

export enum Tag {
  WEST = 'west',
  CENTRAL = 'central',
  NORTH = 'north',
  CTOWN = 'ctown', // college town
  DTOWN = 'dtown', // downtown
  INACTIVE = 'inactive',
  CUSTOM = 'custom'
}

export type LocationType = {
  id: string;
  name: string;
  address: string;
  tag: Tag;
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
    set: (address) => formatAddress(address as string),
    validate: (address) => isAddress(address as string),
  },
  tag: {
    type: String,
    required: true,
    enum: Object.values(Tag),
  },
});

export const Location = dynamoose.model('Locations', schema, { create: false });
