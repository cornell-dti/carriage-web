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

export type BreakTimes = {
  breakStart: string;
  breakEnd: string;
};

export type BreakType = {
  [day: string]: BreakTimes;
};

export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  startTime: string;
  endTime: string;
  breaks: BreakType;
  vehicle: string;
  phoneNumber: string;
  email: string;
  phone: string;
};

export type Ride = {
  type: string;
  id: string;
  startLocation: string;
  endLocation: string;
  startTime: string;
  endTime: string;
  riderId: string;
};

export type Vehicle = {
  id: string;
  name: string;
  capacity: string;
  wheelchairAccessible: boolean;
};

export type Location = {
  id: string;
  name: string;
  address: string;
};

export type Passenger = {
  startTime: string;
  endTime: string;
  name: string;
  pickupLocation: string;
  pickupTag: string;
  dropoffLocation: string;
  dropoffTag: string;
  needs: string;
};

export type TableValue = {
  data: string | null;
  tag?: string;
  buttonHandler?: () => void;
};

export type ObjectType = {
  [x: string]: any;
};
