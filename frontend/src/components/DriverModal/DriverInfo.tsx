import React from 'react';
import cn from 'classnames';
import styles from './drivermodal.module.css';
import { Input } from '../FormElements/FormElements';

type DriverInfoProps = {
  register: any
};


const DriverInfo = ({ register }: DriverInfoProps) => (
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
      type='text'
      placeholder='Email'
      className={cn(styles.input, styles.col1)}
      ref={register({ required: true })}
    />
    <Input
      name='phone'
      type='text'
      placeholder='Phone Number'
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
      className={cn(styles.input, styles.col2)}
      ref={register({ required: true })}
    />
  </div>
);

export default DriverInfo;
