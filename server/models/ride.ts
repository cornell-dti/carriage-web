import dynamoose from 'dynamoose';
import { Location, LocationType } from './location';
import { Rider, RiderType } from './rider';
import { Driver, DriverType } from './driver';

export enum Type {
  ACTIVE = 'active',
  PAST = 'past',
  UNSCHEDULED = 'unscheduled',
}

export type RideType = {
  id: string,
  type: Type,
  startLocation: LocationType,
  endLocation: LocationType,
  startTime: string,
  endTime: string,
  rider: RiderType,
  driver?: DriverType,
};

const schema = new dynamoose.Schema({
  id: {
    hashKey: true,
    type: String,
  },
  type: {
    type: String,
    enum: Object.values(Type),
  },
  startLocation: Location as any,
  endLocation: Location as any,
  startTime: String,
  endTime: String,
  rider: Rider as any,
  driver: Driver as any,
});

export const Ride = dynamoose.model('Rides', schema, { create: false });
