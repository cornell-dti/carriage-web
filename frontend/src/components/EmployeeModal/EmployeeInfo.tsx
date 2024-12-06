import React from 'react';
import { useFormContext } from 'react-hook-form';
import { TextField, Grid } from '@mui/material';

type EmployeeInfoProps = {
  firstName?: string;
  lastName?: string;
  netId?: string;
  phone?: string;
};

const EmployeeInfo = ({
  firstName,
  lastName,
  netId,
  phone,
}: EmployeeInfoProps) => {
  const { register, formState } = useFormContext();
  const { errors } = formState;

  return (
    <Grid container spacing={2} justifyContent="flex-start" sx={{ mt: 1 }}>
      <Grid item>
        <TextField
          id="firstName"
          label="First Name"
          variant="outlined"
          defaultValue={firstName}
          size="small" // Reduces height
          sx={{ width: '175px' }} // Limits the width
          {...register('firstName', { required: true })}
          error={!!errors.firstName}
          helperText={errors.firstName ? 'Please enter a valid name' : ''}
        />
      </Grid>
      <Grid item>
        <TextField
          id="lastName"
          label="Last Name"
          variant="outlined"
          defaultValue={lastName}
          size="small"
          sx={{ width: '175px' }}
          {...register('lastName', { required: true })}
          error={!!errors.lastName}
          helperText={errors.lastName ? 'Please enter a valid name' : ''}
        />
      </Grid>
      <Grid item>
        <TextField
          id="netId"
          label="NetID"
          variant="outlined"
          defaultValue={netId}
          size="small"
          sx={{ width: '175px' }}
          {...register('netid', { required: true })}
          error={!!errors.netid}
          helperText={errors.netid ? 'Please enter a valid NetID' : ''}
        />
      </Grid>
      <Grid item>
        <TextField
          id="phoneNumber"
          label="Phone Number"
          variant="outlined"
          defaultValue={phone}
          size="small"
          sx={{ width: '175px' }}
          {...register('phoneNumber', {
            required: true,
            pattern: /^[0-9]{10}$/,
            maxLength: 10,
            minLength: 10,
          })}
          error={!!errors.phoneNumber}
          helperText={
            errors.phoneNumber
              ? 'Please enter a valid 10-digit phone number'
              : ''
          }
        />
      </Grid>
    </Grid>
  );
};

export default EmployeeInfo;
