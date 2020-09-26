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
    hashKey: true,
  },
  name: String,
  capacity: Number,
  wheelchairAccessible: Boolean,
});

export const Vehicle = dynamoose.model('Vehicles', schema, { create: false });
