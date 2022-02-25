import React, { useEffect, useState, useCallback } from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import { Ride } from '../../types';
import styles from './requestridemodal.module.css';
import { Label, SRLabel } from '../FormElements/FormElements';

type WeekType = {
  [day: string]: boolean;
};

type CustomRepeatingRidesProps = {
  ride?: Ride;
};

const CustomRepeatingRides = ({ ride }: CustomRepeatingRidesProps) => {
  const { register, formState } = useFormContext();
  const { errors } = formState;
  const [week, setWeek] = useState<WeekType>({
    Mon: false,
    Tue: false,
    Wed: false,
    Thu: false,
    Fri: false,
  });
  const dayLabels = {
    Mon: ['M', '1'],
    Tue: ['T', '2'],
    Wed: ['W', '3'],
    Thu: ['Th', '4'],
    Fri: ['F', '5'],
  };

  const handleClick = useCallback(
    (day: string) => {
      setWeek((prev) => ({ ...prev, [day]: !week[day] }));
    },
    [week]
  );

  useEffect(() => {
    if (ride && ride.recurring) {
      const days = Object.keys(dayLabels);
      ride.recurringDays!.forEach((day) => {
        handleClick(days[day - 1]);
      });
    }
  }, [ride]);

  const dayClicked = () =>
    week.Mon || week.Tue || week.Wed || week.Thu || week.Fri;

  return (
    <div className={styles.dayBox}>
      <Label id={'repeatDays'} className={styles.boldLabel}>
        Repeat every
      </Label>
      {Object.entries(dayLabels).map(([day, label]) => (
        <div key={day}>
          <SRLabel id={label[0]}>{day}</SRLabel>
          <button
            aria-labelledby={`${label[0]} repeatDays`}
            name={day}
            type="button"
            ref={register({
              required: true,
              validate: () => dayClicked(),
            })}
            value={week[day] ? label[1] : -1}
            className={cn(styles.day, { [styles.daySelected]: week[day] })}
            onClick={() => handleClick(day)}
          >
            {label[0]}
          </button>
        </div>
      ))}
      {errors.Mon && (
        <p className={styles.error}>Please select at least one day</p>
      )}
    </div>
  );
};

export default CustomRepeatingRides;
