import React from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import { Label, Input } from '../FormElements/FormElements';


import styles from './employeemodal.module.css';

const StartDate = () => {
  const { register } = useFormContext();

  return (
    <div className={cn(styles.col1, styles.workingHours)}>
      <Label htmlFor="startDate">Start Date:</Label>
      <Input
        id="startDate"
        type="date"
        name="startDate"
        ref={register({ required: true })}
      />
    </div>
  );
};

export default StartDate;
