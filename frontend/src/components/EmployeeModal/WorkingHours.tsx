import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  FormHelperText,
  FormGroup,
  Checkbox,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';
import { FormControlLabel } from '@mui/material';

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
  const {
    control,
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<FormData>();

  const dayLabels = { Mon: 'M', Tue: 'T', Wed: 'W', Thu: 'Th', Fri: 'F' };
  const [existingTime, setExistingTime] = useState<string[]>();
  const instance = `availability.${index}` as const;

  // Initialize days state from existingDayArray
  useEffect(() => {
    if (existingDayArray) {
      setValue(`${instance}.days`, existingDayArray);
    }
  }, [existingDayArray, instance, setValue]);

  const prefillTimeRange = useCallback(() => {
    if (existingTimeRange) {
      let [startTime, endTime] = existingTimeRange.split('-');
      startTime = formatTime(startTime);
      endTime = formatTime(endTime);
      setExistingTime([startTime, endTime]);
    }
  }, [existingTimeRange]);

  useEffect(() => {
    prefillTimeRange();
  }, [prefillTimeRange]);

  const formatTime = (time: string): string =>
    moment(time, 'ha').format('HH:mm');

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
        <Controller
          name={`${instance}.days`}
          control={control}
          defaultValue={existingDayArray || []}
          rules={{
            validate: (value) =>
              hide ||
              (value && value.length > 0) ||
              'Please select at least one day',
          }}
          render={({ field }) => (
            <>
              <FormGroup row>
                {Object.entries(dayLabels).map(([day, label]) => (
                  <FormControlLabel
                    key={day}
                    control={
                      <Checkbox
                        checked={field.value?.includes(day) || false}
                        onChange={(event) => {
                          const currentValue = field.value || [];
                          const newValue = event.target.checked
                            ? [...currentValue, day]
                            : currentValue.filter((d) => d !== day);
                          field.onChange(newValue);
                        }}
                      />
                    }
                    label={label}
                  />
                ))}
              </FormGroup>
              {errors.availability?.[index]?.days && (
                <FormHelperText error>
                  {errors.availability?.[index]?.days?.message ||
                    'Please select at least one day'}
                </FormHelperText>
              )}
            </>
          )}
        />
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
  const [availabilityInputs, setAvailabilityInputs] = useState<number[]>([0]);
  const [availabilityArray, setAvailabilityArray] = useState<
    [string, string[]][]
  >([]);

  const addAvailabilityInput = () => {
    setAvailabilityInputs((prev) => [...prev, prev.length]);
  };

  const removeAvailabilityInput = (indexToRemove: number) => {
    setAvailabilityInputs((prev) => prev.filter((_, i) => i !== indexToRemove));
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

  useEffect(() => {
    if (existingAvailability) {
      const map = getAvailabilityMap();
      const newAvailabilityArray: [string, string[]][] = Array.from(
        map,
        ([timeRange, dayArray]) => [timeRange, dayArray]
      );
      setAvailabilityArray(newAvailabilityArray);
      setAvailabilityInputs(
        Array.from({ length: newAvailabilityArray.length }, (_, i) => i)
      );
    }
  }, [existingAvailability, getAvailabilityMap]);

  return (
    <Box sx={{ display: hide ? 'none' : 'block', mt: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Working Hours
      </Typography>
      {availabilityInputs.map((_, index) => (
        <AvailabilityInput
          key={index}
          index={index}
          existingTimeRange={availabilityArray[index]?.[0]}
          existingDayArray={availabilityArray[index]?.[1]}
          hide={hide}
          onRemove={() => removeAvailabilityInput(index)}
          totalCount={availabilityInputs.length}
        />
      ))}
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
