import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import moment from 'moment';
import { useFormContext } from 'react-hook-form';
import styles from './employeemodal.module.css';
import { Input } from '../FormElements/FormElements';
import { WeekProvider, useWeek } from './WeekContext';

type AvailabilityInputProps = {
  index: number;
  existingTimeRange?: string;
  existingDayArray?: string[];
}

const AvailabilityInput = ({
  index,
  existingTimeRange,
  existingDayArray,
}: AvailabilityInputProps) => {
  const {
    selectDay,
    deselectDay,
    isDayOpen,
    isDaySelectedByInstance,
    getSelectedDays,
  } = useWeek();
  const { register, setValue, getValues } = useFormContext();
  const dayLabels = {
    Sun: 'S',
    Mon: 'M',
    Tue: 'T',
    Wed: 'W',
    Thu: 'T',
    Fri: 'F',
    Sat: 'S',
  };
  const [existingTime, setExisingTime] = useState<string[]>();
  // All data for this AvailabilityInput instance will be saved in the form's
  // data in an array 'availability' at index 'index'
  const instance = `availability[${index}]`;
  const days = getSelectedDays(index);

  const handleClick = (day: string) => {
    if (isDaySelectedByInstance(day, index)) {
      deselectDay(day);
    } else if (isDayOpen(day)) {
      selectDay(day, index);
    }
  };

  const prefillDays = (): void => {
    existingDayArray?.forEach((day) => {
      selectDay(day, index);
    });
  };

  const prefillTimeRange = (): void => {
    if (existingTimeRange) {
      // extract start and end times
      let [startTime, endTime] = existingTimeRange.split('-');
      startTime = formatTime(startTime);
      endTime = formatTime(endTime);
      setExisingTime([startTime, endTime]);
    }
  };

  useEffect(() => {
    // Prefill days and time range once
    prefillDays();
    prefillTimeRange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Register day selector as custom form input
    register(`${instance}.days`, { required: true });
  }, [instance, register]);

  useEffect(() => {
    // When selected days changes, update days value
    setValue(`${instance}.days`, days);
  }, [instance, days, setValue]);

  // formats a time string to be suitable to pass into defaultValue
  // of the Input component
  const formatTime = (time: string): string => moment(time, 'ha').format('HH:mm');

  return (
    <div className={styles.availabilityInput}>
      <Input
        name={`${instance}.startTime`}
        type='time'
        className={styles.timeInput}
        defaultValue={existingTime?.[0]}
        ref={register({ required: true })}
      />
      <p className={styles.toText}>to</p>
      <Input
        name={`${instance}.endTime`}
        type='time'
        className={styles.timeInput}
        defaultValue={existingTime?.[1]}
        ref={register({
          required: true,
          validate: (endTime) => {
            const startTime = getValues(`${instance}.startTime`);
            return startTime < endTime;
          },
        })}
      />
      <p className={styles.repeatText}>Repeat on</p>
      {Object.entries(dayLabels).map(([day, label]) => (
        <button
          key={day}
          type="button"
          className={cn(
            styles.day,
            { [styles.daySelected]: isDaySelectedByInstance(day, index) },
          )}
          onClick={() => handleClick(day)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

type WorkingHoursProps = {
  existingAvailability?: string[][];
}

const WorkingHours = ({ existingAvailability }: WorkingHoursProps) => {
  const [numAvailability, setNumAvailability] = useState(existingAvailability ? 0 : 1);
  const [availabilityArray, setAvailabilityArray] = useState<any[]>([]);

  const addAvailabilityInput = () => setNumAvailability((n) => n + 1);

  // returns a map with time ranges as keys and repeating days as values
  const getAvailabilityMap = (): Map<string, string[]> => {
    const availabilityMap = new Map();
    existingAvailability?.forEach((availability) => {
      const [day, timeRange] = availability;
      const dayArray: string[] | undefined = availabilityMap.get(timeRange);
      if (dayArray) { // push day onto dayArray
        dayArray.push(day);
        availabilityMap.set(timeRange, dayArray);
      } else { // create new array
        availabilityMap.set(timeRange, [day]);
      }
    });
    return availabilityMap;
  };

  // transforms the availability map into an array
  const availabilityMapToArray = (map: Map<string, string[]>) => {
    const timeRangeArray = Array.from(map.keys());
    const dayArray = Array.from(map.values());
    if (timeRangeArray.length === dayArray.length) {
      // Each element of newAvailabilityArray is a tuple of (string, string[])
      const newAvailabilityArray: any[] = [];
      for (let i = 0; i < timeRangeArray.length; i += 1) {
        const pair = [timeRangeArray[i], dayArray[i]];
        newAvailabilityArray.push(pair);
      }
      setAvailabilityArray(newAvailabilityArray);
    } else {
      console.log('Error: Sizes of time and day arrays are not equal. This error should be impossible.');
    }
  };

  useEffect(() => {
    availabilityMapToArray(getAvailabilityMap());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.workingHours}>
      <p className={styles.workingHoursTitle}>Working Hours</p>
      <WeekProvider>
        {existingAvailability ? (
          availabilityArray.map(([timeRange, dayArray], index) => (
            <AvailabilityInput
              key={index}
              index={index}
              existingTimeRange={timeRange}
              existingDayArray={dayArray}
            />
          ))
        ) : (
          [...new Array(numAvailability)].map((_, index) => (
            <AvailabilityInput key={index} index={index} />
          ))
        )}
      </WeekProvider>
      <p className={styles.addAvailabilityInput} onClick={addAvailabilityInput}>
        + Add more
      </p>
    </div>
  );
};

export default WorkingHours;
