import React, { useCallback, useEffect, useState } from 'react';
import cn from 'classnames';
import moment from 'moment';
import { useFormContext, UseFormRegister } from 'react-hook-form';
import styles from './employeemodal.module.css';
import { Input, Label } from '../FormElements/FormElements';
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
};

const AvailabilityInput: React.FC<AvailabilityInputProps> = ({
  index,
  existingTimeRange,
  existingDayArray,
  hide,
}) => {
  const {
    selectDay,
    deselectDay,
    isDayOpen,
    isDaySelectedByInstance,
    getSelectedDays,
  } = useWeek();
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<FormData>();
  const dayLabels = {
    Mon: 'M',
    Tue: 'T',
    Wed: 'W',
    Thu: 'T',
    Fri: 'F',
  };
  const [existingTime, setExistingTime] = useState<string[]>();
  const instance = `availability.${index}` as const;
  const days = getSelectedDays(index);

  const handleClick = (day: string) => {
    if (isDaySelectedByInstance(day, index)) {
      deselectDay(day);
    } else if (isDayOpen(day)) {
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
      let [startTime, endTime] = existingTimeRange.split('-');
      startTime = formatTime(startTime);
      endTime = formatTime(endTime);
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

  const formatTime = (time: string): string =>
    moment(time, 'ha').format('HH:mm');

  return (
    <div className={styles.availabilityInput}>
      <div className={styles.timeFlexbox}>
        <Label htmlFor={`${instance}.startTime`}>Start Time</Label>
        <Input
          id={`${instance}.startTime`}
          type="time"
          className={styles.timeInput}
          defaultValue={existingTime?.[0]}
          {...register(`${instance}.startTime` as const, { required: !hide })}
        />
        {errors.availability?.[index]?.startTime && (
          <p className={styles.error}>Please enter a valid start time</p>
        )}
      </div>
      <p className={styles.toText}>to</p>
      <div className={styles.timeFlexbox}>
        <Label htmlFor={`${instance}.endTime`}>End Time</Label>
        <Input
          id={`${instance}.endTime`}
          type="time"
          className={styles.timeInput}
          defaultValue={existingTime?.[1]}
          {...register(`${instance}.endTime` as const, {
            required: !hide,
            validate: (endTime: string) => {
              const startTime = getValues(`${instance}.startTime` as const);
              return hide ? true : startTime < endTime;
            },
          })}
        />
        {errors.availability?.[index]?.endTime && (
          <p className={styles.error}>Please enter a valid end time</p>
        )}
      </div>
      <p className={styles.repeatText}>Repeat on</p>
      <div className={styles.timeFlexbox}>
        <div className={styles.daysBox}>
          {Object.entries(dayLabels).map(([day, label]) => (
            <Input
              key={day}
              type="button"
              value={label}
              className={cn(styles.day, {
                [styles.daySelected]: isDaySelectedByInstance(day, index),
              })}
              onClick={() => handleClick(day)}
            />
          ))}
        </div>
        {errors.availability?.[index]?.days && (
          <p className={cn(styles.error, styles.dayError)}>
            Please select at least one day
          </p>
        )}
      </div>
    </div>
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
    <div className={cn(styles.workingHours, { [styles.hidden]: hide })}>
      <p className={styles.workingHoursTitle}>Working Hours</p>
      <WeekProvider>
        {existingAvailability
          ? availabilityArray.map(([timeRange, dayArray], index) => (
              <AvailabilityInput
                key={index}
                index={index}
                existingTimeRange={timeRange}
                existingDayArray={dayArray}
                hide={hide}
              />
            ))
          : [...Array(numAvailability)].map((_, index) => (
              <AvailabilityInput key={index} index={index} hide={hide} />
            ))}
      </WeekProvider>
      <button
        type="button"
        className={styles.addAvailabilityInput}
        onClick={addAvailabilityInput}
      >
        + Add more
      </button>
    </div>
  );
};

export default WorkingHours;
