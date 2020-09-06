import dynamoose from 'dynamoose';

export type VehicleType = {
  id: string,
  wheelchairAccessible: boolean,
};

const schema = new dynamoose.Schema({
  id: String,
  wheelchairAccessible: Boolean,
});

export const Vehicle = dynamoose.model('Vehicles', schema, { create: false });
