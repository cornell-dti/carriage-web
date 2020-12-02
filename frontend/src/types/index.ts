export type AccessibilityNeeds = {
  hasCrutches: boolean;
  needsAssistant: boolean;
  needsWheelchair: boolean;
};

export type Rider = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  accessibilityNeeds: Array<string>;
  description: string;
  joinDate: string;
  pronouns: string;
  address: string;
};

export type Availability = {
  startTime: string;
  endTime: string;
};

export type AvailabilityType = {
  [day: string]: Availability;
};

export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  availability: AvailabilityType;
  vehicle: Vehicle;
  phoneNumber: string;
  email: string;
  phone: string;
};

export type ObjectType = {
  [x: string]: any;
}

export type Vehicle = {
  id: string;
  name: string;
  capacity: string;
  wheelchairAccessible: boolean;
};

export enum Tag {
  WEST = 'west',
  CENTRAL = 'central',
  NORTH = 'north',
  CTOWN = 'ctown', // college town
  DTOWN = 'dtown', // downtown
}

export type Location = {
  id: string;
  name: string;
  address: string;
  tag?: Tag;
};

export type TableValue = {
  data: string | null;
  tag?: string;
  buttonHandler?: () => void;
  ButtonModal?: () => JSX.Element;
};

<<<<<<< HEAD
export type Dispatcher = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  accessLevel: string;
}
=======
export type Ride = {
  id: string;
  type: string;
  status: string;
  late?: boolean;
  startLocation: Location;
  endLocation: Location;
  startTime: string;
  endTime: string;
  rider: Rider;
  driver?: Driver;
};
>>>>>>> 17795a20eb77fe76ddf8d3f137c6163c75d2951b
