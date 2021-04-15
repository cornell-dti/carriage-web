import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import styles from './employeemodal.module.css';
import { Input, SRLabel } from '../FormElements/FormElements';
import { WeekProvider, useWeek } from './WeekContext';

type AvailabilityInputProps = {
  index: number;
}

const AvailabilityInput = ({ index }: AvailabilityInputProps) => {
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

  useEffect(() => {
    // Register day selector as custom form input
    register(`${instance}.days`, { required: true });
  }, [instance, register]);

  useEffect(() => {
    // When selected days changes, update days value
    setValue(`${instance}.days`, days);
  }, [instance, days, setValue]);

  return (
    <div className={styles.availabilityInput}>
      <SRLabel htmlFor={`${instance}.startTime`}>Start Time</SRLabel>
      <Input
        id={`${instance}.startTime`}
        name={`${instance}.startTime`}
        type='time'
        className={styles.timeInput}
        ref={register({ required: true })}
      />
      <p className={styles.toText}>to</p>
      <SRLabel htmlFor={`${instance}.endTime`}>End Time</SRLabel>
      <Input
        id={`${instance}.endTime`}
        name={`${instance}.endTime`}
        type='time'
        className={styles.timeInput}
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

const WorkingHours = () => {
  const [numAvailability, setNumAvailability] = useState(1);

  const addAvailabilityInput = () => setNumAvailability((n) => n + 1);

  return (
    <div className={styles.workingHours}>
      <p className={styles.workingHoursTitle}>Working Hours</p>
      <WeekProvider>
        {[...new Array(numAvailability)].map((_, index) => (
          <AvailabilityInput key={index} index={index} />
        ))}
      </WeekProvider>
      <p className={styles.addAvailabilityInput} onClick={addAvailabilityInput}>
        + Add more
        </p>
    </div>
  );
};

export default WorkingHours;
