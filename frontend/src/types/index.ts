export type AccessibilityNeeds = {
  hasCrutches: boolean;
  needsAssistant: boolean;
  needsWheelchair: boolean;
}

export type Rider = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  accessibilityNeeds: AccessibilityNeeds;
  description: string;
  joinDate: string;
  pronouns: string;
  address: string;
}

export type Driver = {
  name: string;
  netid: string;
  email: string;
  phone: string;
}

export type Ride = {
  type: string;
  id: string;
  startLocation: string;
  endLocation: string;
  startTime: string;
  endTime: string;
  riderId: string;
}

export type Location = {
  id: string;
  name: string;
  address: string;
}

export type Passenger = {
  startTime: string;
  endTime: string;
  name: string;
  pickupLocation: string;
  pickupTag: string;
  dropoffLocation: string;
  dropoffTag: string;
  needs: string;
}
