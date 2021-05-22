import React, {useEffect, useState} from 'react';
import cn from 'classnames';
import {useFormContext } from 'react-hook-form';
import styles from './requestridemodal.module.css';
import { Label, Input, SRLabel } from '../FormElements/FormElements';

  type WeekType = {
    [day: string]: boolean;
  };


  const CustomRepeatingRides = () => {
    const { register, formState, setValue } = useFormContext();
    const {errors} = formState;
    const [week, setWeek] = useState<WeekType>({
        Mon: false,
        Tue: false,
        Wed: false,
        Thu: false,
        Fri: false,
      });
      const dayLabels = {
        Mon: ['M', "1"],
        Tue: ['T', "2"],
        Wed: ['W', "3"],
        Thu: ['Th', "4"],
        Fri: ['F', "5"],
      };
      const handleClick = (day: string) => {
        setWeek((prev) => ({ ...prev, [day]: !week[day] }));  
      };
      const dayClicked = () => {
        return week["Mon"] || week["Tue"] || week["Wed"] || week["Thu"] || week["Fri"];
      }
      return (
        <div className={styles.box}>
        <Label id = {"repeatDays"} className={styles.boldLabel}>Repeat every</Label>
      {Object.entries(dayLabels).map(([day, label]) => (
         <div key = {day}> 
            <SRLabel id = {label[0]}>{day}</SRLabel>
            <button
            aria-labelledby={`${label[0]} repeatDays`}
            name={day}
            type="button"
            ref={register({ required: true, 
            validate: () => {return dayClicked() }})}
            value={ week[day] ? label[1] : -1}
            className={cn(
                styles.day,
                { [styles.daySelected]: week[day] },
            )}
            onClick={() => handleClick(day)}
            >
              {label[0]}
            </button>
        </div>
      ))}
       {errors.Mon && <p className={styles.error}>
              Please select at least one day</p>}
    </div>
      );
  };

  export default CustomRepeatingRides;