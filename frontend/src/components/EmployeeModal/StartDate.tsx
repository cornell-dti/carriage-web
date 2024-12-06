import React from 'react';
import { useFormContext } from 'react-hook-form';
import { TextField, Box } from '@mui/material';

type StartDateProps = {
  existingDate?: string;
};

const StartDate = ({ existingDate }: StartDateProps) => {
  const { register, formState } = useFormContext();
  const { errors } = formState;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
      <TextField
        id="startDate"
        label="Start Date"
        type="date"
        defaultValue={existingDate}
        InputLabelProps={{
          shrink: true, // Keeps the label visible even when a value is set
        }}
        size="small" // Reduces height of the field
        sx={{ width: '150px' }} // Optional: Adjust width if needed
        {...register('startDate', { required: true })}
        error={!!errors.startDate}
        helperText={errors.startDate ? 'Start date is required' : ''}
      />
    </Box>
  );
};

export default StartDate;
