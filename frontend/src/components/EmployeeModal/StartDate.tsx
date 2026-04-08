import React from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import { Label, Input } from '../FormElements/FormElements';


type StartDateProps = {
  existingDate?: string;
};

const StartDate = ({ existingDate }: StartDateProps) => {
  const { register } = useFormContext();

  return (
    <div className={cn(col1, workingHours)}>
      <Label htmlFor="startDate">Start Date:</Label>
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
