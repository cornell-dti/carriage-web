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
            <Label htmlFor="startLocation">Pickup Location</Label>
            <Input
                id='startLocation'
                name='startLocation'
                type='text'
                className={cn(styles.input)}
                ref={register({ required: true })}
            />
        </div>
        <div className = {styles.col2}>
            <Label htmlFor="endLocation">Dropoff Location</Label>
            <Input
                id='endLocation'
                name='endLocation'
                type='text'
                className={cn(styles.input)}
                ref={register({ required: true })}
            />
        </div>
        <div className = {styles.col1}>
            <Label htmlFor="pickupTime">Pickup Time</Label>
            <Input
                id='pickupTime'
                name='pickupTime'
                type='time'
                className={cn(styles.input)}
                ref={register({ required: true })}
            />
        </div>
        <div className = {styles.col2}>
            <Label htmlFor="dropoffTime">Dropoff Time</Label>
            <Input
                id='dropoffTime'
                name='dropoffTime'
                type='time'
                className={cn(styles.input)}
                ref={register({ required: true })}
            />
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
        <Label id = "duration"> Duration </Label>
        <SRLabel id= "startDate">Start Date</SRLabel>
        <Input 
            type = "date"
            name = "startDate"
            aria-labelledby="duration startDate"
            ref={register({ required: true })}
        />
        <p> to </p>
        <SRLabel id= "endDate">End Date</SRLabel>
        <Input
            type="date"
            name="endDate"
            aria-labelledby="duration endDate"
            ref={register({ required: true })}
          />
    </div>
  ); 
};

export default RequestRideInfo;