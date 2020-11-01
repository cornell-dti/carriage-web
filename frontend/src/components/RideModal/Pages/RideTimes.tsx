import React from 'react';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import { ModalPageProps } from '../../Modal/types';
import { ObjectType } from '../../../types/index';
import { Button, Input, Label } from '../../FormElements/FormElements';
import styles from '../ridemodal.module.css';

const RideTimesPage = ({ onSubmit }: ModalPageProps) => {
  const { register, handleSubmit, getValues } = useForm();

  const beforeSubmit = ({ date, pickupTime, dropoffTime }: ObjectType) => {
    const startTime = new Date(`${date} ${pickupTime} EST`).toISOString();
    const endTime = new Date(`${date} ${dropoffTime} EST`).toISOString();
    onSubmit({ startTime, endTime });
  };

  return (
    <form onSubmit={handleSubmit(beforeSubmit)} className={styles.form}>
      <div className={cn(styles.inputContainer, styles.rideTime)}>
        <div className={styles.date}>
          <Label htmlFor="date">Date:</Label>
          <Input
            type="date"
            name="date"
            ref={register({ required: true })}
          />
        </div>
        <div className={styles.pickupTime}>
          <Label htmlFor="pickupTime">Pickup time:</Label>
          <Input
            type="time"
            name="pickupTime"
            ref={register({ required: true })}
          />
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
        </div>
      </div>
      <Button type="submit">Next</Button>
    </form >
  );
};

export default RideTimesPage;
