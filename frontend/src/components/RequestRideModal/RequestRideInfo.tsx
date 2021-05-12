import React, {useState} from 'react';
import cn from 'classnames';
import moment from 'moment';
import {useFormContext } from 'react-hook-form';
import styles from './requestridemodal.module.css';
import { Label, Input, SRLabel } from '../FormElements/FormElements';

type RequestRideInfoProps = {
    startLocation?: string; 
    endLocation?: string; 
    startTime?: string; 
    endTime?: string; 
    recurringDays?: number[]; 
    startDate?: string; 
    endDate?: string; 
}
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

const RequestRideInfo = () => {
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
    <div className={styles.inputContainer}>
        <div className = {styles.col1}>
            <Label id="day" className={styles.largeLabel}>Day</Label>
            <Input
                id='dayInput'
                name='day'
                type='date'
                className={cn(styles.input)}
                ref={register({ required: true })}
            />
        </div>
        <div className = {styles.col2}>
            <Label htmlFor={"repeating"}>Repeating?</Label>
            <Input
            type="checkbox"
            id="repeating"
            name="repeating"
            ref={register({ required: false })}/>
        </div>
        <div className={styles.dayBox}>
            <label id = {"repeatDays"}>Repeat On</label>
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
    </div>
  ); 
};

export default RequestRideInfo;