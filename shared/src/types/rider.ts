export enum Accessibility {
  ASSISTANT = 'Assistant',
  CRUTCHES = 'Crutches',
  WHEELCHAIR = 'Wheelchair',
  MOTOR_SCOOTER = 'Motorized Scooter',
  KNEE_SCOOTER = 'Knee Scooter',
  LOW_VISION = 'Low Vision/Blind',
  SERVICE_ANIMALS = 'Service Animal',
}

export enum Organization {
  REDRUNNER = 'RedRunner',
  CULIFT = 'CULift',
}

export type RiderType = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email: string;
  accessibility?: Accessibility[];
  organization?: Organization;
  description?: string;
  joinDate: string;
  endDate: string;
  address: string;
  favoriteLocations: string[];
  photoLink?: string;
  active: boolean;
};
