import React from 'react';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import { Button, Input, Label } from '../FormElements/FormElements';
import styles from './ridermodal.module.css';
import { ObjectType } from '../../types/index';

type ModalFormProps = {
  onSubmit: (data: ObjectType) => void;
  formData?: ObjectType;
}

const RiderModalInfo = ({ onSubmit }: ModalFormProps) => {
  const { register, handleSubmit } = useForm();
  const beforeSubmit = ({ name, netid, email, phoneNumber, needs,
    address, start, end }: ObjectType) => {
    const startDate = new Date(`${start}`).toISOString();
    const endDate = new Date(`${end}`).toISOString();
    const splitName = name.split(' ');
    const firstName = splitName[0];
    const lastName = splitName[1];
    const accessibilityNeeds = needs.split(',');
    onSubmit({
      id: netid,
      firstName,
      lastName,
      email,
      phoneNumber,
      accessibilityNeeds,
      address,
      startDate,
      endDate,
    });
  };
  return (
    <form onSubmit={handleSubmit(beforeSubmit)} className={styles.form}>
      <div className={cn(styles.inputContainer, styles.rideTime)}>
        <div className={cn(styles.gridR1, styles.gridC1)}>
          <Input
            name="name"
            type="text"
            placeholder="Name"
            ref={register({ required: true })}
          />
        </div>
        <div className={cn(styles.gridR1, styles.gridC2)}>
          <Input
            name="netid"
            type="text"
            placeholder="NetID"
            ref={register({ required: true })}
          />
        </div>
        <div className={cn(styles.gridR2, styles.gridC1)}>
          <Input
            name="email"
            type="text"
            placeholder="Email"
            ref={register({ required: true })}
          />
        </div>
        <div className={cn(styles.gridR2, styles.gridC2)}>
          <Input
            name="phoneNumber"
            type="text"
            placeholder="Phone Number"
            ref={register({ required: true })}
          />
        </div>
        <div className={cn(styles.gridR3, styles.gridC1)}>
          <Input
            name="needs"
            type="text"
            placeholder="Needs"
            ref={register({ required: true })}
          />
        </div>
        <div className={cn(styles.gridR3, styles.gridC2)}>
          <Input
            name="address"
            type="text"
            placeholder="Address"
            ref={register({ required: true })}
          />
        </div>
        <div className={cn(styles.gridR4, styles.gridC1)}>
          <Label htmlFor="start">Start Date:</Label>
          <Input
            type="date"
            name="start"
            ref={register({ required: true })}
          />
        </div>
        <div className={cn(styles.gridR4, styles.gridC2)}>
          <Label htmlFor="end">End Date:</Label>
          <Input
            type="date"
            name="end"
            ref={register({ required: true })}
          />
        </div>
      </div>
      <Button type="submit">Add a Student</Button>
    </form>
  );
};

export default RiderModalInfo;
