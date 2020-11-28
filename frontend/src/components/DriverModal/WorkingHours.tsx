import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import styles from './drivermodal.module.css';
import { Input } from '../FormElements/FormElements';
import { useWorkingHours } from './WorkingHoursContext';
import { ObjectType } from '../../types/index';

const HourInput = () => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [days, setDays] = useState(new Set<string>());
  const { clearDay, updateDays, isDaySelected } = useWorkingHours();
  const dayLabels = {
    Sun: 'S',
    Mon: 'M',
    Tue: 'T',
    Wed: 'W',
    Thu: 'T',
    Fri: 'F',
    Sat: 'S',
  };

  const handleClick = (day: string) => {
    if (!isDaySelected(day) && !days.has(day)) {
      setDays((prev) => new Set(prev.add(day)));
    } else if (isDaySelected(day) && days.has(day)) {
      setDays((prev) => {
        prev.delete(day);
        return new Set(prev);
      });
      clearDay(day);
    }
  };

  useEffect(() => {
    updateDays(Array.from(days), startTime, endTime);
  }, [days, endTime, startTime, updateDays]);

  return (
    <div className={styles.hourInput}>
      <Input
        type='time'
        style={{ fontSize: 'initial' }}
        onChange={(e) => setStartTime(e.target.value)}
      />
      <p className={styles.toText}>to</p>
      <Input
        type='time'
        style={{ fontSize: 'initial' }}
        onChange={(e) => setEndTime(e.target.value)}
      />
      <p className={styles.repeatText}>Repeat on</p>
      {Object.entries(dayLabels).map(([day, label]) => (
        <button
          key={day}
          type="button"
          className={cn(styles.day, { [styles.daySelected]: days.has(day) })}
          onClick={() => handleClick(day)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

type WorkingHoursProps = {
  onChange: (data: ObjectType) => void;
}

const WorkingHours = ({ onChange }: WorkingHoursProps) => {
  const [numHourInputs, setNumHourInputs] = useState(1);
  const { availability } = useWorkingHours();

  const addHourInput = () => setNumHourInputs((p) => p + 1);

  useEffect(() => {
    onChange(availability);
  }, [availability, onChange]);

  return (
    <div className={styles.workingHours}>
      <p className={styles.workingHoursTitle}>Working Hours</p>
      {[...new Array(numHourInputs)].map((_, index) => (
        <HourInput key={index} />
      ))}
      <p className={styles.addHourInput} onClick={addHourInput}>+ Add more</p>
    </div>
  );
};

export default WorkingHours;
