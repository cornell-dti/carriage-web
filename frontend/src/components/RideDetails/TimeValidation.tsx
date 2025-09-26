import dayjs, { Dayjs } from 'dayjs';

export interface TimeValidationError {
  type:
    | 'start_time_past'
    | 'end_time_before_start'
    | 'same_time'
    | 'too_long_duration'
    | 'invalid_time';
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
    minDurationMinutes = 5,
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

  return {
    isValid: errors.length === 0,
    errors,
  };
};
