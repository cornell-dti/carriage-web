import dynamoose from 'dynamoose';

export type VehicleType = {
  id: string,
  name: string,
  capacity: number,
  wheelchairAccessible: boolean,
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
  capacity: {
    type: Number,
    required: true,
  },
  wheelchairAccessible: {
    type: Boolean,
    required: true,
  },
});

export const Vehicle = dynamoose.model('Vehicles', schema, { create: false });
