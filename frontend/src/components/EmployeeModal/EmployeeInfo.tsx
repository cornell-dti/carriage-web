import React from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import styles from './employeemodal.module.css';
import { Input, Label } from '../FormElements/FormElements';

type EmployeeInfoProps = {
  firstName?: string;
  lastName?: string;
  netId?: string;
  phone?: string;
};

const EmployeeInfo = ({
  firstName,
  lastName,
  netId,
  phone,
}: EmployeeInfoProps) => {
  const { register, formState } = useFormContext();
  const { errors } = formState;
  return (
    <div className={styles.inputContainer}>
      <div className={styles.col1}>
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          type="text"
          defaultValue={firstName}
          className={cn(styles.input)}
          aria-required="true"
          {...register('firstName', { required: true })}
        />
        {errors.firstName && (
          <p className={styles.error}>Please enter a valid name</p>
        )}
      </div>
      <div className={styles.col2}>
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          type="text"
          defaultValue={lastName}
          className={cn(styles.input)}
          aria-required="true"
          {...register('lastName', { required: true })}
        />
        {errors.lastName && (
          <p className={styles.error}>Please enter a valid name</p>
        )}
      </div>
      <div className={styles.col1}>
        <Label htmlFor="netid">NetID</Label>
        <Input
          id="netid"
          type="text"
          defaultValue={netId}
          className={cn(styles.input)}
          aria-required="true"
          {...register('netid', { required: true })}
        />
        {errors.netid && (
          <p className={styles.error}>Please enter a valid NetID</p>
        )}
      </div>
      <div className={styles.col2}>
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          type="tel"
          defaultValue={phone}
          min={10}
          max={10}
          aria-required="true"
          className={cn(styles.input)}
          {...register('phoneNumber', {
            required: true,
            pattern: /^[0-9]{10}$/,
            maxLength: 10,
            minLength: 10,
          })}
        />
        {errors.phoneNumber && (
          <p className={styles.error}>Please enter a valid phone number</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeInfo;
