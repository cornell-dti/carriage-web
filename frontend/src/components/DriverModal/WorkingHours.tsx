import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import styles from './drivermodal.module.css';
import { Input } from '../FormElements/FormElements';
import { useWorkingHours } from './WorkingHoursContext';
import { ObjectType } from '../../types/index';

type HourInputProps = {
  index: number;
  register: any;
  setValue: any;
}

const HourInput = ({ index, register, setValue }: HourInputProps) => {
  const [days, setDays] = useState<ObjectType>({});
  const { toggleDay, isDaySelected } = useWorkingHours();
  const dayLabels = {
    Sun: 'S',
    Mon: 'M',
    Tue: 'T',
    Wed: 'W',
    Thu: 'T',
    Fri: 'F',
    Sat: 'S',
  };
  const availabilityItem = `availability[${index}]`;

  const handleClick = (day: string) => {
    if (!isDaySelected(day) && !days[day]) {
      setDays((prev) => ({ ...prev, [day]: 1 }));
      toggleDay(day);
    } else if (isDaySelected(day) && days[day]) {
      setDays((prev) => ({ ...prev, [day]: 0 }));
      toggleDay(day);
    }
  };

  useEffect(() => {
    // Register day selector as form input
    register(`${availabilityItem}.days`, { required: true });
  });

  useEffect(() => {
    // Update days value with all days that have value 1
    const dayList = Object.keys(days).filter((day) => days[day]);
    setValue(`${availabilityItem}.days`, dayList);
  }, [availabilityItem, days, setValue]);

  return (
    <div className={styles.hourInput}>
      <Input
        name={`${availabilityItem}.startTime`}
        type='time'
        style={{ fontSize: 'initial' }}
        ref={register({ required: true })}
      />
      <p className={styles.toText}>to</p>
      <Input
        name={`${availabilityItem}.endTime`}
        type='time'
        style={{ fontSize: 'initial' }}
        ref={register({ required: true })}
      />
      <p className={styles.repeatText}>Repeat on</p>
      {Object.entries(dayLabels).map(([day, label]) => (
        <button
          key={day}
          type="button"
          className={cn(styles.day, { [styles.daySelected]: days[day] })}
          onClick={() => handleClick(day)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

type WorkingHoursProps = {
  register: any;
  setValue: any;
}

const WorkingHours = ({ register, setValue }: WorkingHoursProps) => {
  const [numHourInputs, setNumHourInputs] = useState(1);

  const addHourInput = () => setNumHourInputs((p) => p + 1);

  return (
    <div className={styles.workingHours}>
      <p className={styles.workingHoursTitle}>Working Hours</p>
      {[...new Array(numHourInputs)].map((_, index) => (
        <HourInput
          key={index}
          index={index}
          register={register}
          setValue={setValue}
        />
      ))}
      <p className={styles.addHourInput} onClick={addHourInput}>+ Add more</p>
    </div>
  );
};

export default WorkingHours;
