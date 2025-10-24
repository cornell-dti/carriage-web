import { DayOfWeek } from '@shared/types/driver';

const formatAvailability = (availability?: DayOfWeek[]) => {
  if (!availability) return null;
  return availability.map((day) => [day, 'Available']);
};

export default formatAvailability;
