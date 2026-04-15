import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { DayOfWeek } from '../../types';

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
    <div className="flex flex-col gap-4 mb-6">
      <h3 className="mb-3.5">Working Days</h3>
      <div className="flex gap-2 items-center">
        {orderedDays.map((day: DayOfWeek) => (
          <button
            key={day}
            type="button"
            className={`rounded-full h-10 w-10 border border-black/20 p-0 cursor-pointer font-medium transition-colors duration-200 ${
              selectedDays.includes(day)
                ? 'bg-black text-white hover:bg-[#333]'
                : 'bg-black/5 hover:bg-black/10'
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
