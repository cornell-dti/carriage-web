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

export type BreakTimes = {
  breakStart: string;
  breakEnd: string;
}

export type BreakType = {
  [day: string]: BreakTimes;
}

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
};

export type Vehicle = {
  id: string;
  name: string;
  capacity: string;
  wheelchairAccessible: boolean;
}
