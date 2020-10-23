import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import { Button, Input, Label } from '../FormElements/FormElements';
import styles from './ridermodal.module.css';
import { ObjectType, Driver, Rider, Location } from '../../types/index';

type ModalFormProps = {
  onSubmit: (data: ObjectType) => void;
  formData?: ObjectType;
}

const RiderModalInfo = ({ onSubmit }: ModalFormProps) => {
  const { register, handleSubmit, getValues } = useForm();
  const beforeSubmit = ({ start, end }: ObjectType) => {
    const startDate = new Date(`${start}`).toISOString();
    const endDate = new Date(`${end}`).toISOString();
    onSubmit({ startDate, endDate });
  };
  return (
    <form onSubmit={handleSubmit(beforeSubmit)} className={styles.form}>
      <div className={cn(styles.inputContainer, styles.rideTime)}>
        <div className={styles.date}>
          <Label htmlFor="start">Date:</Label>
          <Input
            type="date"
            name="start"
            ref={register({ required: true })}
          />
        </div>
        <div className={styles.date}>
          <Label htmlFor="end">Date:</Label>
          <Input
            type="date"
            name="end"
            ref={register({ required: true })}
          />
        </div>
      </div>
    </form>
  );
};

export default RiderModalInfo;
