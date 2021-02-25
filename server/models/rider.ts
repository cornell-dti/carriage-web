import dynamoose from 'dynamoose';

export enum Accessibility {
  ASSISTANT = 'Assistant',
  CRUTCHES = 'Crutches',
  WHEELCHAIR = 'Wheelchair',
}

export enum Organization {
  REDRUNNER = 'RedRunner',
  CULIFT = 'CULift'
}

export type RiderType = {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  accessibility: Accessibility[]
  organization: Organization
  description: string
  joinDate: string
  pronouns: string
  address: string
  favoriteLocations: string[]
  photoLink?: string
};

const schema = new dynamoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
  phoneNumber: String,
  email: String,
  accessibility: {
    type: Array,
    schema: [String],
  },
  organization: {
    type: String,
    enum: Object.values(Organization),
  },
  description: String,
  joinDate: String,
  pronouns: String,
  address: String,
  favoriteLocations: {
    type: Array,
    schema: [String],
  },
  photoLink: String,
});

export const Rider = dynamoose.model('Riders', schema, { create: false });
