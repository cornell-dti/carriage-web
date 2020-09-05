import dynamoose from 'dynamoose';

export type RiderType = {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  accessibilityNeeds: {
    needsWheelchair: boolean
    hasCrutches: boolean
    needsAssistant: boolean
  }
  description: string
  joinDate: string
  pronouns: string
  address: string
  favoriteLocations: string[]
};

const schema = new dynamoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
  phoneNumber: String,
  email: String,
  accessibilityNeeds: {
    type: Object,
    schema: {
      needsWheelchair: Boolean,
      hasCrutches: Boolean,
      needsAssistant: Boolean,
    },
  },
  description: String,
  joinDate: String,
  pronouns: String,
  address: String,
  favoriteLocations: {
    type: Array,
    schema: [{ type: String }],
  },
});

export const Rider = dynamoose.model('Riders', schema, { create: false });
