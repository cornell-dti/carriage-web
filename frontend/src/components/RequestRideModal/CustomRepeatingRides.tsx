import React, {useState} from 'react';
import cn from 'classnames';
import {useFormContext } from 'react-hook-form';
import styles from './requestridemodal.module.css';
import moment from 'moment';
import { Label, Input, SRLabel } from '../FormElements/FormElements';
const dayLabels = {
    Sun: 'S',
    Mon: 'M',
    Tue: 'T',
    Wed: 'W',
    Thu: 'T',
    Fri: 'F',
    Sat: 'S',
  };

  type WeekType = {
    [day: string]: boolean;
  };

  const CustomRepeatingRides = () => {
    const currDate = new Date(); 
    const { register, formState } = useFormContext();
    const {errors} = formState;
    const [week, setWeek] = useState<WeekType>({
        Sun: false,
        Mon: false,
        Tue: false,
        Wed: false,
        Thu: false,
        Fri: false,
        Sat: false,
      });
      const handleClick = (day: string) => {
        setWeek((prev) => ({ ...prev, [day]: !week[day] }));
      };
      return (
        <div className={styles.dayBox}>
        <Label id = {"repeatDays"}>Repeat every</Label>
        <SRLabel id={"repeatNumber"}>Number of times before a repeat</SRLabel>
        <Input
            type="number"
            name="repeatNumber"
            className={cn(styles.numberInput)}
            min={1}
            aria-labelledby={"repeatDays repeatNumber"}
            ref={register({ required: true, min: 0})}
            />
        <SRLabel id={"repeatTimes"}>How often to repeat</SRLabel>
        <select 
            name="repetition"
            aria-labelledby="repeatDays repeatTimes"
            ref={register({ required: true })}>
        <option value="weeks">weeks</option>
        <option value=" months"> months</option>
      </select>
            <p>on</p>
      {Object.entries(dayLabels).map(([day, label]) => (
         <div> 
            <SRLabel id = {label}>{day}</SRLabel>
            <Input
            aria-labelledby={`${label} repeatDays`}
            key={day}
            name={"days"}
            type="button"
            value={label}
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