import React from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import styles from './employeemodal.module.css';
import { Input, SRLabel } from '../FormElements/FormElements';

type EmployeeInfoProps = {
  name?: string;
  netId?: string;
  email?: string;
  phone?: string;
}

const EmployeeInfo = ({ name, netId, email, phone }:EmployeeInfoProps) => {
  const { register, formState } = useFormContext();
  const { errors } = formState;
  return (
    <div className={styles.inputContainer}>
      <div className = {styles.col1}>
        <SRLabel htmlFor={'name'}>Name</SRLabel>
        <Input
          id='name'
          name='name'
          type='text'
          placeholder='Name'
          defaultValue={name}
          className={cn(styles.input)}
          ref={register({ required: true })}
        />
        {errors.name && <p className={styles.error}>Please enter a valid name</p>}
      </div>
      <div className = {styles.col2}>
        <SRLabel htmlFor={'netid'}>NetID</SRLabel>
        <Input
          name='netid'
          id='netid'
          type='text'
          placeholder='NetID'
          defaultValue={netId}
          className={cn(styles.input)}
          ref={register({ required: true })}
        />
        {errors.netid && <p className={styles.error}>Please enter a valid NetID</p>}
      </div>
      <div className = {styles.col1}>
        <SRLabel htmlFor={'email'}>Email</SRLabel>
        <Input
          name='email'
          id='email'
          type='text'
          placeholder='Email'
          defaultValue={email}
          className={cn(styles.input)}
          ref={register({ required: true, pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/ })}
        />
        {errors.email && <p className={styles.error}> Please enter a valid email</p>}
      </div>
      <div className = {styles.col2}>
        <SRLabel htmlFor={'phoneNumber'}>Phone Number</SRLabel>
        <Input
          name='phoneNumber'
          id='phoneNumber'
          type='tel'
          placeholder='Phone Number'
          defaultValue={phone}
          min={10}
          max={10}
          className={cn(styles.input)}
          ref={register({ required: true, pattern: /[0-9]{10}/, maxLength: 10, minLength: 10 })}
        />
        {formState.errors.phoneNumber
          && <p className={styles.error}>Please enter a valid phone number </p>}
      </div>
    </div>
  );
};

export default EmployeeInfo;
