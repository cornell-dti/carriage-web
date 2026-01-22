import React from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import { Label, Input } from '../FormElements/FormElements';

import styles from './employeemodal.module.css';

type StartDateProps = {
  existingDate?: string;
};

const StartDate = ({ existingDate }: StartDateProps) => {
  const { register } = useFormContext();

  return (
    <div className={cn(styles.col1, styles.workingHours)}>
      <Label htmlFor="startDate" required>Start Date:</Label>
      <Input
        id="startDate"
        type="date"
        defaultValue={existingDate}
        aria-required="true"
        {...register('startDate', { required: true })}
      />
    </div>
  );
};

export default StartDate;
