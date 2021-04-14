import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import styles from './employeemodal.module.css';
import { Input } from '../FormElements/FormElements';
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
  const { register, setValue, getValues, formState } = useFormContext();
  const { errors } = formState;
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
    // Register day selector as custom form input. 
    //Not putting error message here since there is no default behavior to override
    register(`${instance}.days`, { 
      required: true, 
      validate: () => {return days.length > 0}});
  }, [instance, register, days]);

  useEffect(() => {
    // When selected days changes, update days value
    setValue(`${instance}.days`, days);
  }, [instance, days, setValue]);

  return (
    <div className={styles.availabilityInput}>
      <div className={styles.timeFlexbox}>
        <Input
          name={`${instance}.startTime`}
          type='time'
          className={styles.timeInput}
          ref={register({ required: "Please enter a valid start time"})}
        />
        {errors.availability && errors.availability[index] && 
          errors.availability[index].startTime &&  
          <p className={styles.error}>{errors.availability[index].startTime.message}</p>
        }  
        </div>
      <p className={styles.toText}>to</p>
      <div className={styles.timeFlexbox}>
      <Input
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
        {errors.availability && errors.availability[index] && 
          errors.availability[index].endTime &&
          <p className={styles.error}>Please enter a valid end time</p> 
        }    
        </div>
      <p className={styles.repeatText}>Repeat on</p>
      <div className={styles.timeFlexbox}>
        <div className={styles.daysBox}>
          {Object.entries(dayLabels).map(([day, label]) => (
            <Input
              key={day}
              name={`${instance}.days`}
              type="button"
              value={label}
              className={cn(
                styles.day,
                { [styles.daySelected]: isDaySelectedByInstance(day, index) },
              )}
              onClick={() => handleClick(day)}
            />
          ))}
        </div>
        {errors.availability && errors.availability[index] && 
            errors.availability[index].days &&  
            <p className={cn(styles.error, styles.dayError)}>Please select at least one day</p>
          }    
      </div>
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
