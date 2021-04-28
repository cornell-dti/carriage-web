import React from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import styles from './employeemodal.module.css';
import { Input } from '../FormElements/FormElements';

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
      <Input
        name='name'
        type='text'
        placeholder='Name'
        defaultValue={name}
        className={cn(styles.input, styles.col1)}
        ref={register({ required: true })}
      />
      <Input
        name='netid'
        type='text'
        placeholder='NetID'
        defaultValue={netId}
        className={cn(styles.input, styles.col2)}
        ref={register({ required: true })}
      />
      <Input
        name='email'
        type='email'
        placeholder='Email'
        defaultValue={email}
        className={cn(styles.input, styles.col1)}
        ref={register({ required: true })}
      />
      <Input
        name='phoneNumber'
        type='tel'
        pattern="[0-9]{10}"
        placeholder='Phone Number'
        defaultValue={phone}
        min={10}
        max={10}
        className={cn(styles.input, styles.col2)}
        ref={register({ required: true })}
      />
    </div >
  );
};

export default EmployeeInfo;
