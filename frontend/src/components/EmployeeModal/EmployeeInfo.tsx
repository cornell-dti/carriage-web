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

const EmployeeInfo = ({name, netId, email, phone}:EmployeeInfoProps) => {
  const { register } = useFormContext();
  return (
    <div className={styles.inputContainer}>
      <SRLabel htmlFor={'name'}>Name</SRLabel>
      <Input
        name='name'
        id='name'
        type='text'
        placeholder='Name'
        defaultValue={name}
        className={cn(styles.input, styles.col1)}
        ref={register({ required: true })}
      />
      <SRLabel htmlFor={'netid'}>NetID</SRLabel>
      <Input
        name='netid'
        id='netid'
        type='text'
        placeholder='NetID'
        defaultValue={netId}
        className={cn(styles.input, styles.col2)}
        ref={register({ required: true })}
      />
      <SRLabel htmlFor={'email'}>Email</SRLabel>
      <Input
        name='email'
        id='email'
        type='email'
        placeholder='Email'
        defaultValue={email}
        className={cn(styles.input, styles.col1)}
        ref={register({ required: true })}
      />
      <SRLabel htmlFor={'phoneNumber'}>Phone Number</SRLabel>
      <Input
        name='phoneNumber'
        id='phoneNumber'
        type='tel'
        pattern="[0-9]{10}"
        placeholder='Phone Number'
        defaultValue={phone}
        min={10}
        max={10}
        className={cn(styles.input, styles.col2)}
        ref={register({ required: true })}
      />
    </div>
  );
};

export default EmployeeInfo;
