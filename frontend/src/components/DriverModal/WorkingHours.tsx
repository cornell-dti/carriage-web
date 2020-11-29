import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import styles from './drivermodal.module.css';
import { Input } from '../FormElements/FormElements';
import { AvailabilityProvider, useAvailability } from './AvailabilityContext';

type HourInputProps = {
  index: number;
}

const HourInput = ({ index }: HourInputProps) => {
  const {
    selectDay,
    deselectDay,
    isDayOpen,
    isDaySelectedByInstance,
    getSelectedDays,
  } = useAvailability();
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
  // All data for this HourInput instance will be saved in the form's data in
  // an array 'availability' at index 'index'
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
  });

  useEffect(() => {
    // When selected days changes, update days value
    setValue(`${instance}.days`, days);
  }, [instance, days, setValue]);

  return (
    <div className={styles.hourInput}>
      <Input
        name={`${instance}.startTime`}
        type='time'
        style={{ fontSize: 'initial' }}
        ref={register({ required: true })}
      />
      <p className={styles.toText}>to</p>
      <Input
        name={`${instance}.endTime`}
        type='time'
        style={{ fontSize: 'initial' }}
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
  const [numHourInputs, setNumHourInputs] = useState(1);

  const addHourInput = () => setNumHourInputs((p) => p + 1);

  return (
    <div className={styles.workingHours}>
      <p className={styles.workingHoursTitle}>Working Hours</p>
      <AvailabilityProvider>
        {[...new Array(numHourInputs)].map((_, index) => (
          <HourInput key={index} index={index} />
        ))}
      </AvailabilityProvider>
      <p className={styles.addHourInput} onClick={addHourInput}>+ Add more</p>
    </div>
  );
};

export default WorkingHours;
