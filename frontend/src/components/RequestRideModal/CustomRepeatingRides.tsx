import React, { useEffect, useState, useCallback } from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import { RideType } from '@carriage-web/shared/types/ride';
import { Label, SRLabel } from '../FormElements/FormElements';

type WeekType = {
  [day: string]: boolean;
};

type CustomRepeatingRidesProps = {
  ride?: RideType;
};

const CustomRepeatingRides = ({ ride }: CustomRepeatingRidesProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
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
    if (ride && ride.isRecurring) {
      // Recurring rides not yet implemented - disable for now
      console.warn('Recurring rides not yet supported');
    }
  }, [ride, handleClick, dayLabels]);

  const dayClicked = () =>
    week.Mon || week.Tue || week.Wed || week.Thu || week.Fri;

  return (
    <div dayBox}>
      <Label id={'repeatDays'} boldLabel}>
        Repeat every
      </Label>
      {Object.entries(dayLabels).map(([day, label]) => (
        <div key={day}>
          <SRLabel id={label[0]}>{day}</SRLabel>
          <button
            aria-labelledby={`${label[0]} repeatDays`}
            type="button"
            aria-required="true"
            {...register(day, {
              required: true,
              validate: () => dayClicked(),
            })}
            value={week[day] ? label[1] : -1}
            className={cn(day, { 'week[day] })}
            onClick={() => handleClick(day)}
          >
            {label[0]}
          </button>
        </div>
      ))}
      {errors.Mon && (
        <p error}>Please select at least one day</p>
      )}
    </div>
  );
};

export default CustomRepeatingRides;
