import React from 'react';
import cn from 'classnames';
import {useFormContext } from 'react-hook-form';
import styles from './employeemodal.module.css';
import { Input } from '../FormElements/FormElements';


const EmployeeInfo = () => {
  const { register, formState } = useFormContext();
  const {errors} = formState;
  return (
    <div className={styles.inputContainer}>
      <div className = {styles.col1}>
        <Input
          name='name'
          type='text'
          placeholder='Name'
          className={cn(styles.input)}
          ref={register({ required: "Please enter a valid name" })}
        />
        {errors.name && <p className={styles.error}>{errors.name.message}</p>}
      </div>
      <div className = {styles.col2}>
        <Input
          name='netid'
          type='text'
          placeholder='NetID'
          className={cn(styles.input)}
          ref={register({ required: "Please enter a valid NetID" })}
        />
        {errors.netid && <p className={styles.error}>{errors.netid.message}</p>}
      </div>
      <div className = {styles.col1}>
        <Input
          name='email'
          type='email'
          placeholder='Email'
          className={cn(styles.input)}
          ref={register({ required: "Please enter a valid email" })}
        />
        {errors.email && <p className={styles.error}>{errors.email.message}</p>}
      </div>
      <div className = {styles.col2}>
        <Input
          name='phoneNumber'
          type='tel'
          pattern="[0-9]{10}"
          placeholder='Phone Number'
          min={10}
          max={10}
          className={cn(styles.input)}
          ref={register({ required: "Please enter a valid phone number" })}
        />
        {formState.errors.phoneNumber && 
          <p className={styles.error}>{errors.phoneNumber.message}</p>}
      </div>
    </div>
  );
};

export default EmployeeInfo;
