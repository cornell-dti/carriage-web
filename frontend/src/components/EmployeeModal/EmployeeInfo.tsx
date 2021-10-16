import React from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import styles from './employeemodal.module.css';
import { Input, Label } from '../FormElements/FormElements';

type EmployeeInfoProps = {
  firstName?: string;
  lastName?: string;
  netId?: string;
  email?: string;
  phone?: string;
};

const EmployeeInfo = ({
  firstName,
  lastName,
  netId,
  email,
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
          ref={register({ required: true })}
        />
        {errors.firstName && (
          <p className={styles.error}>Please enter a valid name</p>
        )}
        <Label htmlFor={'netid'}>NetID</Label>
        <Input
          name="netid"
          id="netid"
          type="text"
          defaultValue={netId}
          className={cn(styles.input)}
          ref={register({ required: true })}
        />
        {errors.netid && (
          <p className={styles.error}>Please enter a valid NetID</p>
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
          ref={register({ required: true })}
        />
        {errors.lastName && (
          <p className={styles.error}>Please enter a valid name</p>
        )}
      </div>
      <div className={styles.col1}>
        <Label htmlFor={'email'}>Email</Label>
        <Input
          name="email"
          id="email"
          type="text"
          defaultValue={email}
          className={cn(styles.input)}
          ref={register({
            required: true,
            pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
          })}
        />
        {errors.email && (
          <p className={styles.error}> Please enter a valid email</p>
        )}
      </div>
      <div className={styles.col2}>
        <Label htmlFor={'phoneNumber'}>Phone Number</Label>
        <Input
          name="phoneNumber"
          id="phoneNumber"
          type="tel"
          defaultValue={phone}
          min={10}
          max={10}
          className={cn(styles.input)}
          ref={register({
            required: true,
            pattern: /[0-9]{10}/,
            maxLength: 10,
            minLength: 10,
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
