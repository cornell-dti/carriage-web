import React from 'react';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import moment from 'moment';
import { ModalPageProps } from '../../Modal/types';
import { Button, Input, Label } from '../../FormElements/FormElements';
import styles from '../ridemodal.module.css';

const RideTimesPage = ({ formData, onSubmit }: ModalPageProps) => {
  const { register, formState, handleSubmit, getValues } = useForm({
    defaultValues: {
      date: formData?.date ?? '',
      pickupTime: formData?.pickupTime ?? '',
      dropoffTime: formData?.dropoffTime ?? '',
    },
  });
  const { errors } = formState;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={cn(styles.inputContainer, styles.rideTime)}>
        <div className={styles.date}>
          <div>
            <Label htmlFor="date">Date:</Label>
            <Input
              type="date"
              name="date"
              ref={register({ required: true })}
            />
            {errors.date && <p className={styles.error}>Please enter a date</p>}
          </div>
        </div>
        <div className={styles.pickupTime}>
          <Label htmlFor="pickupTime">Pickup time:</Label>
          <Input
            type="time"
            name="pickupTime"
            ref={register({
              required: true,
              validate: (pickupTime) => {
                const date = getValues('date');
                return moment().isBefore(moment(`${date} ${pickupTime}`));
              },
            })}
          />
          {errors.pickupTime?.type === 'required' && (
            <p className={styles.error}>Please enter a time</p>
          )}
          {errors.pickupTime?.type === 'validate' && (
            <p className={styles.error}>Invalid time</p>
          )}
        </div>
        <div className={styles.dropoffTime}>
          <Label htmlFor="dropoffTime">Dropoff time:</Label>
          <Input
            type="time"
            name="dropoffTime"
            ref={register({
              required: true,
              validate: (dropoffTime) => {
                const pickupTime = getValues('pickupTime');
                return pickupTime < dropoffTime;
              },
            })}
          />
          {errors.dropoffTime?.type === 'required' && (
            <p className={styles.error}>Please enter a time</p>
          )}
          {errors.dropoffTime?.type === 'validate' && (
            <p className={styles.error}>Invalid time</p>
          )}
        </div>
      </div>
      <Button type="submit">Next</Button>
    </form >
  );
};

export default RideTimesPage;
