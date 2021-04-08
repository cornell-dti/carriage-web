import React from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import styles from './employeemodal.module.css';
import { Input } from '../FormElements/FormElements';


const EmployeeInfo = () => {
  const { register } = useFormContext();
  return (
    <div className={styles.inputContainer}>
      <Input
        name='name'
        type='text'
        placeholder='Name'
        className={cn(styles.input, styles.col1)}
        ref={register({ required: true })}
      />
      <Input
        name='netid'
        type='text'
        placeholder='NetID'
        className={cn(styles.input, styles.col2)}
        ref={register({ required: true })}
      />
      <Input
        name='email'
        type='email'
        placeholder='Email'
        className={cn(styles.input, styles.col1)}
        ref={register({ required: true })}
      />
      <Input
        name='phoneNumber'
        type='tel'
        pattern="[0-9]{10}"
        placeholder='Phone Number'
        min={10}
        max={10}
        className={cn(styles.input, styles.col2)}
        ref={register({ required: true })}
      />
    </div>
  );
};

export default EmployeeInfo;
