import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { DayOfWeek } from '../../types';
import styles from './employeemodal.module.css';

type WorkingHoursProps = {
  existingAvailability?: string[];
  hide: boolean;
};

const WorkingHours = ({ existingAvailability, hide }: WorkingHoursProps) => {
  const { register, setValue } = useFormContext();
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(
    () => (existingAvailability as DayOfWeek[]) || []
  );

  const orderedDays: DayOfWeek[] = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
  ];

  const dayToLetter: Record<DayOfWeek, string> = {
    [DayOfWeek.MONDAY]: 'M',
    [DayOfWeek.TUESDAY]: 'T',
    [DayOfWeek.WEDNESDAY]: 'W',
    [DayOfWeek.THURSDAY]: 'T',
    [DayOfWeek.FRIDAY]: 'F',
  };

  const handleDayClick = (day: DayOfWeek) => {
    setSelectedDays((prevSelectedDays) => {
      let updatedDays = prevSelectedDays.includes(day)
        ? prevSelectedDays.filter((d) => d !== day)
        : [...prevSelectedDays, day];
      updatedDays = updatedDays.sort(
        (a, b) => orderedDays.indexOf(a) - orderedDays.indexOf(b)
      );
      setValue('availability', updatedDays);
      return updatedDays;
    });
  };

  // Register the availability field once
  React.useEffect(() => {
    register('availability');
  }, [register]);

  // If existing availability changes (e.g., when opening modal), sync selection
  React.useEffect(() => {
    const normalized = (existingAvailability as DayOfWeek[]) || [];
    setSelectedDays(normalized);
    setValue('availability', normalized);
  }, [existingAvailability, setValue]);

  if (hide) return null;

  return (
    <div className={styles.availabilityContainer}>
      <h3 className={styles.workingHoursTitle}>Working Days</h3>
      <div className={styles.daysContainer}>
        {orderedDays.map((day: DayOfWeek) => (
          <button
            key={day}
            type="button"
            className={`${styles.dayButton} ${
              selectedDays.includes(day) ? styles.daySelected : ''
            }`}
            onClick={() => handleDayClick(day)}
          >
            {dayToLetter[day]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WorkingHours;
