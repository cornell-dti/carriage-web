import React from 'react';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import { Button, Input } from '../FormElements/FormElements';
import styles from './ridermodal.module.css';
import { ObjectType, Accessibility } from '../../types/index';

type ModalFormProps = {
  onSubmit: (data: ObjectType) => void;
  formData?: ObjectType;
}

const RiderModalInfo = ({ onSubmit }: ModalFormProps) => {
  const { register, errors, handleSubmit, getValues } = useForm();
  const beforeSubmit = ({ name, netid, phoneNumber, needs,
    address, start, end }: ObjectType) => {
    const email = `${netid}@cornell.edu`;
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
        <div className={cn(styles.gridR1, styles.gridCSmall1)}>
          <Input
            name="name"
            type="text"
            placeholder="Name"
            ref={register({ required: true, pattern: /^[a-zA-Z]+\s[a-zA-Z]+/ })}
          />
          {errors.name && 
          <p className={styles.error}>enter a valid name</p>}
        </div>
        <div className={cn(styles.gridR1, styles.gridCSmall2)}>
          <Input
            name="netid"
            type="text"
            placeholder="NetID"
            ref={register({ required: true, pattern: /^[a-zA-Z]+[0-9]+$/ })}
          />
          {errors.netid && 
          <p className={styles.error}>enter a valid netid</p>}
        </div>
        <div className={cn(styles.gridR1, styles.gridCSmall3)}>
          <Input
            name="phoneNumber"
            type="text"
            placeholder="Phone Number"
            ref={register({ required: true, pattern: /^[0-9]{10}$/ })}
          />
          {errors.phoneNumber && 
          <p className={styles.error}>enter a valid phone number</p>}
        </div>
        <div className={cn(styles.gridR2, styles.gridCBig1)}>
          <Input
            name="needs"
            type="text"
            placeholder="Needs"
            ref={register({ 
              required: true,
              validate: (needs) => {
                const needsArr = needs.split(',');
                const isValidNeed = (acc: boolean, val: Accessibility) => 
                  acc && Object.values(Accessibility).includes(val);
                return needsArr.reduce(isValidNeed, true);
              }
            })}
          />
          {errors.needs?.type === 'required' && (
            <p className={styles.error}>enter some needs</p>
          )}
          {errors.needs?.type === 'validate' && (
            <p className={styles.error}>
              Invalid needs. You can only enter 'Assistant', 'Crunches', or 'Wheelchair'
            </p>
          )}
        </div>
        <div className={cn(styles.gridR2, styles.gridCBig2)}>
          <Input
            name="address"
            type="text"
            placeholder="Address"
            ref={register({ required: true })}
          />
          {/* TODO: may need to validate address */}
          {errors.address &&
          <p className={styles.error}>enter an address</p>}
        </div>
        <div className={cn(styles.gridR3, styles.gridCSmall1, styles.duration)}>
          Duration
        </div>
        <div className={cn(styles.gridR4, styles.gridCSmall1)}>
          <Input
            type="date"
            name="start"
            ref={register({ required: true })}
          />
          {errors.start &&
          <p className={styles.error}>enter a start time</p>}
        </div>
        <div className={cn(styles.gridR4, styles.to)}>
          to:
        </div>
        <div className={cn(styles.gridR4, styles.end)}>
          <Input
            type="date"
            name="end"
            ref={register({ 
              required: true,
              validate: (end) => {
                const start = getValues('start');
                return start < end;
              },
            })}
          />
          {errors.end?.type === 'required' &&
          <p className={styles.error}>enter an end time</p>}
          {errors.end?.type === 'validate' &&
          <p className={styles.error}>Invalid end time</p>}
        </div>
      </div>
      <Button type="submit">Add a Rider</Button>
    </form>
  );
};

export default RiderModalInfo;
