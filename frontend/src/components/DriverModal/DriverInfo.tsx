import React from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import styles from './drivermodal.module.css';
import { Input } from '../FormElements/FormElements';


const DriverInfo = () => {
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
        name='phone'
        type='tel'
        pattern="[0-9]{10}"
        placeholder='Phone Number'
        min={10}
        max={10}
        className={cn(styles.input, styles.col2)}
        ref={register({ required: true })}
      />
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
        min={0}
        className={cn(styles.input, styles.col2)}
        ref={register({ required: true, min: 0 })}
      />
    </div>
  );
};

export default DriverInfo;
