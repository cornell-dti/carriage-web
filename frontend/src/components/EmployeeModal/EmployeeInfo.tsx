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
        <Label htmlFor={'firstName'}>First Name</Label>
        <Input
          id="firstName"
          name="firstName"
          type="text"
          defaultValue={firstName}
          className={cn(styles.input)}
          aria-required="true"
          ref={register({ required: true })}
        />
        {errors.firstName && (
          <p className={styles.error}>Please enter a valid name</p>
        )}
      </div>
      <div className={styles.col2}>
        <Label htmlFor={'lastName'}>Last Name</Label>
        <Input
          id="lastName"
          name="lastName"
          type="text"
          defaultValue={lastName}
          className={cn(styles.input)}
          aria-required="true"
          ref={register({ required: true })}
        />
        {errors.lastName && (
          <p className={styles.error}>Please enter a valid name</p>
        )}
      </div>
      <div className={styles.col1}>
        <Label htmlFor={'netid'}>NetID</Label>
        <Input
          name="netid"
          id="netid"
          type="text"
          defaultValue={netId}
          className={cn(styles.input)}
          aria-required="true"
          ref={register({ required: true })}
        />
        {errors.netid && (
          <p className={styles.error}>Please enter a valid NetID</p>
        )}
      </div>

      <div className={styles.col2}>
        <Label htmlFor={'phoneNumber'}>Phone Number</Label>
        <Input
          name="phoneNumber"
          id="phoneNumber"
          type="tel"
          defaultValue={phone}
          aria-required="true"
          className={cn(styles.input)}
          ref={register({
            required: true,
            pattern: /^\d{3}-?\d{3}-?\d{4}$/ //phone numbers can optionally take dashes
          })}
        />
        {formState.errors.phoneNumber && (
          <p className={styles.error}>Please enter a valid phone number </p>
        )}
      </div>
    </div>
  );
};

export default EmployeeInfo;
