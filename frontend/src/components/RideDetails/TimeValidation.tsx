import dayjs, { Dayjs } from 'dayjs';

export interface TimeValidationError {
  type:
    | 'start_time_past'
    | 'end_time_before_start'
    | 'same_time'
    | 'too_long_duration'
    | 'invalid_time'
    | 'weekend_occurrence'
    | 'scheduling_deadline_passed';
  message: string;
}

export interface TimeValidationResult {
  isValid: boolean;
  errors: TimeValidationError[];
}

export const validateRideTimes = (
  startTime: string | Dayjs,
  endTime: string | Dayjs,
  options: {
    allowPastTimes?: boolean;
    maxDurationHours?: number;
    minDurationMinutes?: number;
  } = {}
): TimeValidationResult => {
  const {
    allowPastTimes = false,
    maxDurationHours = 24,
    minDurationMinutes = 1,
  } = options;

  const errors: TimeValidationError[] = [];

  const start = dayjs(startTime);
  const end = dayjs(endTime);
  const now = dayjs();

  // Check if start time is in the past
  if (!allowPastTimes && start.isBefore(now, 'minute')) {
    errors.push({
      type: 'start_time_past',
      message: 'Start time cannot be in the past',
    });
  }

  // Check if end time is before or same as start time
  if (end.isBefore(start) || end.isSame(start)) {
    errors.push({
      type: 'end_time_before_start',
      message: 'End time must be after start time',
    });
  }

  // Check if times are exactly the same
  if (start.isSame(end)) {
    errors.push({
      type: 'same_time',
      message: 'Start and end times cannot be the same',
    });
  }

  // Check minimum duration
  const durationMinutes = end.diff(start, 'minute');
  if (durationMinutes < minDurationMinutes) {
    errors.push({
      type: 'too_long_duration',
      message: `Ride duration must be at least ${minDurationMinutes} minutes`,
    });
  }

  // Check maximum duration
  const durationHours = end.diff(start, 'hour', true);
  if (durationHours > maxDurationHours) {
    errors.push({
      type: 'too_long_duration',
      message: `Ride duration cannot exceed ${maxDurationHours} hours`,
    });
  }

  // Check weekends
  if (start.day() === 0 || start.day() === 6 || end.day() === 0 || end.day() === 6) {
    errors.push({
      type: 'weekend_occurrence',
      message: 'Ride cannot occur on a weekend',
    });
  }

  // Check that rides must be scheduled between 7:45am and 10:00 pm
  if (start.isBefore(start.hour(7).minute(45)) || end.isAfter(end.hour(22))) {
    errors.push({
      type: 'invalid_time',
      message: 'Ride must be scheduled between 7:45am and 10:00 pm',
    });
  }

  // Check that ride times are scheduled in five-minute intervals
  if (start.minute() % 5 !== 0 || end.minute() % 5 !== 0) {
    errors.push({
      type: 'invalid_time',
      message: 'Start and end time must be in five-minute intervals',
    });
  }

  // Check that rides must be scheduled by 10am the previous business day  
  let previousBusinessDay = start.subtract(1, 'day');
  while (previousBusinessDay.day() === 0 || previousBusinessDay.day() === 6) {
    previousBusinessDay = previousBusinessDay.subtract(1, 'day');
  }
  const deadline = previousBusinessDay.set('hour', 10).set('minute', 0).set('second', 0);
  
  if (now.isAfter(deadline)) {
    errors.push({
      type: 'scheduling_deadline_passed',
      message: `Ride must be scheduled by 10am on previous day (${previousBusinessDay.format('dddd')} ${previousBusinessDay.format('MM/DD/YYYY')})`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
