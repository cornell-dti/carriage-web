import dynamoose from 'dynamoose';

export type LocationType = {
  id: string,
  name: string,
  address: string,
};

const schema = new dynamoose.Schema({
  id: String,
  name: String,
  address: String,
});

export const Location = dynamoose.model('Locations', schema, { create: false });
