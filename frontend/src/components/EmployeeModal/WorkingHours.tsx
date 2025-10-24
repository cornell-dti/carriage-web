import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { DayOfWeek } from '@carriage-web/shared/types/driver';
import styles from './employeemodal.module.css';

type WorkingHoursProps = {
  existingAvailability?: string[];
  hide: boolean;
};

const WorkingHours = ({
  existingAvailability = [],
  hide,
}: WorkingHoursProps) => {
  const { register, setValue } = useFormContext();
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(
    (existingAvailability as DayOfWeek[]) || []
  );

  const handleDayClick = (day: DayOfWeek) => {
    const updatedDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];

    setSelectedDays(updatedDays);
    setValue('availability', updatedDays);
  };

  // Register the availability field and keep it in sync
  React.useEffect(() => {
    register('availability');
  }, [register]);

  React.useEffect(() => {
    setValue('availability', selectedDays);
  }, [setValue, selectedDays]);

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
        <button
          type="button"
          className={`${styles.dayButton} ${
            selectedDays.includes(DayOfWeek.MONDAY) ? styles.daySelected : ''
          }`}
          onClick={() => handleDayClick(DayOfWeek.MONDAY)}
        >
          M
        </button>
        <button
          type="button"
          className={`${styles.dayButton} ${
            selectedDays.includes(DayOfWeek.TUESDAY) ? styles.daySelected : ''
          }`}
          onClick={() => handleDayClick(DayOfWeek.TUESDAY)}
        >
          T
        </button>
        <button
          type="button"
          className={`${styles.dayButton} ${
            selectedDays.includes(DayOfWeek.WEDNESDAY) ? styles.daySelected : ''
          }`}
          onClick={() => handleDayClick(DayOfWeek.WEDNESDAY)}
        >
          W
        </button>
        <button
          type="button"
          className={`${styles.dayButton} ${
            selectedDays.includes(DayOfWeek.THURSDAY) ? styles.daySelected : ''
          }`}
          onClick={() => handleDayClick(DayOfWeek.THURSDAY)}
        >
          T
        </button>
        <button
          type="button"
          className={`${styles.dayButton} ${
            selectedDays.includes(DayOfWeek.FRIDAY) ? styles.daySelected : ''
          }`}
          onClick={() => handleDayClick(DayOfWeek.FRIDAY)}
        >
          F
        </button>
      </div>
    </div>
  );
};

export default WorkingHours;
