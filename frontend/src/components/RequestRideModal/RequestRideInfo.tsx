import React from 'react';
import cn from 'classnames';
import moment from 'moment';
import {useFormContext } from 'react-hook-form';
import styles from './requestridemodal.module.css';
import { Label, Input } from '../FormElements/FormElements';

type RequestRideInfoProps = {
    startLocation?: string; 
    endLocation?: string; 
    startTime?: string; 
    endTime?: string; 
    recurringDays?: number[]; 
    startDate?: string; 
    endDate?: string; 
}

const RequestRideInfo = () => {
    const { register, formState } = useFormContext();
  const {errors} = formState;
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
    </div>
  ); 
};

export default RequestRideInfo;