import React from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import styles from './drivermodal.module.css';
import { Input } from '../FormElements/FormElements';


const DriverInfo = () => {
  const { register, formState } = useFormContext();
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
        {formState.errors.name && <p className={styles.error}>Please enter a valid name</p>}
      </div>
      <div className = {styles.col2}>
        <Input
          name='netid'
          type='text'
          placeholder='NetID'
          className={cn(styles.input)}
          ref={register({ required: true })}
        />
        {formState.errors.netid && <p className={styles.error}>Please enter a valid NetID</p>}
      </div>
      <div className = {styles.col1}>
        <Input
          name='email'
          type='email'
          placeholder='Email'
          className={cn(styles.input)}
          ref={register({ required: true })}
        />
        {formState.errors.email && <p className={styles.error}>Please enter a valid email</p>}
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
          ref={register({ required: true })}
        />
        {formState.errors.phoneNumber && 
          <p className={styles.error}>Please enter a valid phone number</p>}
      </div>
      <Input
        name='carType'
        type='text'
        placeholder='Car Type'
        className={cn(styles.input, styles.col1)}
        ref={register({ required: true })}
      />
      <Input
        name='capacity'
        type='number'
        placeholder='Capacity'
        min={1}
        className={cn(styles.input, styles.col2)}
        ref={register({ required: true, min: 1 })}
      />
    </div>
  );
};

export default DriverInfo;
