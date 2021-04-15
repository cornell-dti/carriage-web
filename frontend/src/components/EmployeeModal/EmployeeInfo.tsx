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
          ref={register({ required: true })}
        />
        {errors.name && <p className={styles.error}>Please enter a valid name</p>}
      </div>
      <div className = {styles.col2}>
        <Input
          name='netid'
          type='text'
          placeholder='NetID'
          className={cn(styles.input)}
          ref={register({ required: true })}
        />
        {errors.netid && <p className={styles.error}>Please enter a valid NetID</p>}
      </div>
      <div className = {styles.col1}>
        <Input
          name='email'
          type='text'
          placeholder='Email'
          className={cn(styles.input)}
          ref={register({ required:true, pattern:/^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/})}
        />
        {errors.email && <p className={styles.error}> Please enter a valid email</p>}
      </div>
      <div className = {styles.col2}>
        <Input
          name='phoneNumber'
          type='tel'
          placeholder='Phone Number'
          min={10}
          max={10}
          className={cn(styles.input)}
          ref={register({ required: true, pattern:/[0-9]{10}/, maxLength: 10, minLength: 10})}
        />
        {formState.errors.phoneNumber && 
          <p className={styles.error}>Please enter a valid phone number </p>}
      </div>
    </div>
  );
};

export default EmployeeInfo;
