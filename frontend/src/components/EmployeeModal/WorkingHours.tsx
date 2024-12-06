import React, { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { WeekProvider, useWeek } from './WeekContext';

type FormData = {
  availability: {
    startTime: string;
    endTime: string;
    days: string[];
  }[];
};

type AvailabilityInputProps = {
  index: number;
  existingTimeRange?: string;
  existingDayArray?: string[];
  hide: boolean;
  onRemove?: () => void;
  totalCount: number;
};

const AvailabilityInput: React.FC<AvailabilityInputProps> = ({
  index,
  existingTimeRange,
  existingDayArray,
  hide,
  onRemove,
  totalCount,
}) => {
  const { selectDay, deselectDay, isDaySelectedByInstance, getSelectedDays } =
    useWeek();
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<FormData>();
  const dayLabels = { Mon: 'M', Tue: 'T', Wed: 'W', Thu: 'T', Fri: 'F' };
  const [existingTime, setExistingTime] = useState<string[]>();
  const instance = `availability.${index}` as const;
  const days = getSelectedDays(index);

  const handleClick = (day: string) => {
    if (isDaySelectedByInstance(day, index)) {
      deselectDay(day, index);
    } else {
      selectDay(day, index);
    }
  };

  const prefillDays = useCallback(() => {
    existingDayArray?.forEach((day) => {
      selectDay(day, index);
    });
  }, [existingDayArray, index, selectDay]);

  const prefillTimeRange = useCallback(() => {
    if (existingTimeRange) {
      const [startTime, endTime] = existingTimeRange.split('-');
      setExistingTime([startTime, endTime]);
    }
  }, [existingTimeRange]);

  useEffect(() => {
    prefillDays();
    prefillTimeRange();
  }, [prefillDays, prefillTimeRange]);

  useEffect(() => {
    setValue(`${instance}.days`, days);
  }, [instance, days, setValue]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          width: '135px',
        }}
      >
        <TextField
          label="Start Time"
          type="time"
          size="small"
          defaultValue={existingTime?.[0]}
          error={!!errors.availability?.[index]?.startTime}
          helperText={
            errors.availability?.[index]?.startTime
              ? 'Please enter a valid start time'
              : ''
          }
          {...register(`${instance}.startTime` as const, { required: !hide })}
        />
      </Box>
      <Typography>to</Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          width: '135px',
        }}
      >
        <TextField
          label="End Time"
          type="time"
          size="small"
          defaultValue={existingTime?.[1]}
          error={!!errors.availability?.[index]?.endTime}
          helperText={
            errors.availability?.[index]?.endTime
              ? 'Please enter a valid end time'
              : ''
          }
          {...register(`${instance}.endTime` as const, {
            required: !hide,
            validate: (endTime: string) => {
              const startTime = getValues(`${instance}.startTime` as const);
              return hide ? true : startTime < endTime;
            },
          })}
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: -1 }}>
        <Typography>Repeat on</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {Object.entries(dayLabels).map(([day, label]) => (
            <Chip
              key={day}
              label={label}
              color={
                isDaySelectedByInstance(day, index) ? 'primary' : 'default'
              }
              onClick={() => handleClick(day)}
              clickable
              size="small"
            />
          ))}
        </Box>
        {errors.availability?.[index]?.days && (
          <Typography variant="caption" color="error">
            Please select at least one day
          </Typography>
        )}
      </Box>
      {onRemove && (
        <IconButton
          onClick={onRemove}
          aria-label="Remove working hours"
          size="small"
          color="error"
        >
          {totalCount > 1 && <DeleteIcon />}
        </IconButton>
      )}
    </Box>
  );
};

type WorkingHoursProps = {
  existingAvailability?: string[][];
  hide: boolean;
};

const WorkingHours: React.FC<WorkingHoursProps> = ({
  existingAvailability,
  hide,
}) => {
  const [numAvailability, setNumAvailability] = useState(
    existingAvailability ? 0 : 1
  );
  const [availabilityArray, setAvailabilityArray] = useState<
    [string, string[]][]
  >([]);

  const addAvailabilityInput = () => setNumAvailability((n) => n + 1);
  const removeAvailabilityInput = (indexToRemove: number) => {
    setNumAvailability((n) => Math.max(1, n - 1));
    setAvailabilityArray((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const getAvailabilityMap = useCallback((): Map<string, string[]> => {
    const availabilityMap = new Map();
    existingAvailability?.forEach((availability) => {
      const [day, timeRange] = availability;
      const dayArray = availabilityMap.get(timeRange) || [];
      dayArray.push(day);
      availabilityMap.set(timeRange, dayArray);
    });
    return availabilityMap;
  }, [existingAvailability]);

  const availabilityMapToArray = useCallback((map: Map<string, string[]>) => {
    const newAvailabilityArray: [string, string[]][] = Array.from(
      map,
      ([timeRange, dayArray]) => [timeRange, dayArray]
    );
    setAvailabilityArray(newAvailabilityArray);
  }, []);

  useEffect(() => {
    availabilityMapToArray(getAvailabilityMap());
  }, [getAvailabilityMap, availabilityMapToArray]);

  return (
    <Box sx={{ display: hide ? 'none' : 'block', mt: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Working Hours
      </Typography>
      <WeekProvider>
        {existingAvailability
          ? availabilityArray.map(([timeRange, dayArray], index) => (
              <AvailabilityInput
                key={index}
                index={index}
                existingTimeRange={timeRange}
                existingDayArray={dayArray}
                hide={hide}
                onRemove={() => removeAvailabilityInput(index)}
                totalCount={availabilityArray.length}
              />
            ))
          : [...Array(numAvailability)].map((_, index) => (
              <AvailabilityInput
                key={index}
                index={index}
                hide={hide}
                onRemove={() => removeAvailabilityInput(index)}
                totalCount={numAvailability}
              />
            ))}
      </WeekProvider>
      <Button
        variant="text"
        color="primary"
        onClick={addAvailabilityInput}
        sx={{ mt: 1 }}
      >
        + Add more
      </Button>
    </Box>
  );
};

export default WorkingHours;
