import React, {useState} from 'react';
import cn from 'classnames';
import {useFormContext } from 'react-hook-form';
import styles from './requestridemodal.module.css';
import { Label, Input, SRLabel } from '../FormElements/FormElements';
type dayLabelType = {
    [day: string]: string[]
}
const dayLabels: dayLabelType = {
    Mon: ['M', "1"],
    Tue: ['T', "2"],
    Wed: ['W', "3"],
    Thu: ['T', "4"],
    Fri: ['F', "5"],
  };

  type WeekType = {
    [day: string]: boolean;
  };

  const CustomRepeatingRides = () => {
    const currDate = new Date(); 
    const { register, formState } = useFormContext();
    const {errors} = formState;
    const [week, setWeek] = useState<WeekType>({
        Mon: false,
        Tue: false,
        Wed: false,
        Thu: false,
        Fri: false,
      });
      const handleClick = (day: string) => {
        setWeek((prev) => ({ ...prev, [day]: !week[day] }));
      };
      return (
        <div className={styles.dayBox}>
        <Label id = {"repeatDays"}>Repeat every</Label>
      {Object.entries(dayLabels).map(([day, label]) => (
         <div> 
            <SRLabel id = {label[0]}>{day}</SRLabel>
            <Input
            aria-labelledby={`${label} repeatDays`}
            key={day}
            name={"days"}
            type="button"
            value={label[1]}
            className={cn(
                styles.day,
                { [styles.daySelected]: week[day] },
            )}
            onClick={() => handleClick(day)}
            />
        </div>
      ))}
    </div>
      );
  };

  export default CustomRepeatingRides;