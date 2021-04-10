import React, { useEffect, useState } from 'react';
import cn from 'classnames';
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
  existingDayArray 
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
    existingDayArray?.forEach(day => {
      selectDay(day, index);
    });
  };

  useEffect(() => {
    // Prefill time range and days once
    prefillTimeRange();
    prefillDays();
  }, []);

  useEffect(() => {
    // Register day selector as custom form input
    register(`${instance}.days`, { required: true });
  }, [instance, register]);

  useEffect(() => {
    // When selected days changes, update days value
    setValue(`${instance}.days`, days);
  }, [instance, days, setValue]);

  const formatTime = (time: string): string => {
    if (time.includes('am')) {
      // remove 'am' from time
      let [timeAM] = time.split('am');
      if (timeAM === '12') { //12am edge case
        timeAM = '00'; //00:00 translates to 12am
      } else if (timeAM.length === 1) { 
        // pad time to be in the format HH:MM
        timeAM = `0${timeAM}`;
      }
      return `${timeAM}:00`;
    } else {
      // remove 'pm' from time
      let [timePM] = time.split('pm');
      // Add 12 to the hour
      let timePMInt = parseInt(timePM);
      if (timePMInt !== 12) { //check for edge case, 12:00 translates to 12pm
        timePMInt += 12;
      }
      timePM = timePMInt.toString();
      // pad time to be in the format HH:mm
      if (timePM.length === 1) {
        timePM = `0${timePM}`;
      }
      return `${timePM}:00`
    }
  }

  const prefillTimeRange = (): void => {
    if (existingTimeRange) {
      //extract start and end times
      let [startTime, endTime] = existingTimeRange.split('-');
      startTime = formatTime(startTime);
      endTime = formatTime(endTime);
      setExisingTime([startTime, endTime]);
    }
  };

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

type availabilityPair = [string, string[]];

const WorkingHours = ({ existingAvailability }: WorkingHoursProps) => {
  const [numAvailability, setNumAvailability] = useState(existingAvailability? 0:1);
  const [availabilityArray, setAvailabilityArray] = useState<availabilityPair[]>([]);

  const addAvailabilityInput = () => setNumAvailability((n) => n + 1);

  const getAvailabilityMap = (): Map<string, string[]> => {
    let availabilityMap = new Map();
    existingAvailability?.forEach(availability => {
      const [day, timeRange] = availability;
      const dayArray: string[] | undefined = availabilityMap.get(timeRange);
      if (dayArray) {
        dayArray.push(day);
        availabilityMap.set(timeRange, dayArray);
      } else { //create new array
        availabilityMap.set(timeRange, [day]);
      }
    });
    return availabilityMap;
  };

  const availabilityMapToArray = (map: Map<string, string[]>) => {
    const timeRangeArray = Array.from(map.keys());
    const dayArray = Array.from(map.values());
    if (timeRangeArray.length === dayArray.length) {
      // Each element of newAvailabilityArray is a tuple of (string, string[])
      let newAvailabilityArray: availabilityPair[] = [];
      for (let i = 0; i < timeRangeArray.length; i++) {
        const pair: availabilityPair = [timeRangeArray[i], dayArray[i]]; //auto concat issue
        newAvailabilityArray.push(pair);
      }
      setAvailabilityArray(newAvailabilityArray);
    } else {
      console.log("Error: Sizes of time and day arrays are not equal. \
      This error should be impossible.");
    }
  }

  useEffect(() => {
    availabilityMapToArray(getAvailabilityMap());
  }, []);

  return (
    <div className={styles.workingHours}>
      <p className={styles.workingHoursTitle}>Working Hours</p>
      <p>Num Avail: { numAvailability }</p>
      { existingAvailability ? 
      <WeekProvider>
        {availabilityArray.map(([timeRange, dayArray], index) => (
            <AvailabilityInput 
            key={index} 
            index={index} 
            existingTimeRange={timeRange}
            existingDayArray={dayArray}
            />
        ))}
        {[...new Array(numAvailability)].map((_, index) => (
            <AvailabilityInput 
              key={index + availabilityArray.length} 
              index={index + availabilityArray.length} 
            />
        ))}
      </WeekProvider>
      : <WeekProvider>
        {[...new Array(numAvailability)].map((_, index) => (
          <AvailabilityInput key={index} index={index} />
        ))}
      </WeekProvider>
      }
      <p className={styles.addAvailabilityInput} onClick={addAvailabilityInput}>
        + Add more
      </p>

      <p className={styles.addAvailabilityInput} onClick={getAvailabilityMap}>
      <br></br>getAvailabilityMap
      </p>
    </div>
  );
};

export default WorkingHours;
