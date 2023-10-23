import React from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import styles from './employeemodal.module.css';
import { Input, Label } from '../FormElements/FormElements';

type EmployeeInfoProps = {
  firstName?: string;
  lastName?: string;
  netId?: string;
  phone?: string;
};

// The component accepts firstName, lastName, netId, and phone as optional props,
// The component uses the useFormContext hook to access the form methods and state from the parent form context.
// It retrieves the register function and formState object, which includes validation errors.
// The component renders input fields for First Name, Last Name, NetID, and Phone Number with its respective label using the htmlFor attribute.
// The defaultValue prop is used for the input fields if values are not provided.
// The register function is used to register each input field with form validation rules
// If validation errors occur, error messages are displayed below the corresponding input fields.
// Error messages are conditionally rendered based on the presence of errors in the formState.errors object.
// Styles are imported from the employeemodal.module.css file

const EmployeeInfo = ({
  firstName,
  lastName,
  netId,
  phone,
}: EmployeeInfoProps) => {
  const { register, formState } = useFormContext();
  const { errors } = formState;
  return (
    <div className={styles.inputContainer}>
      <div className={styles.col1}>
        <Label htmlFor={'firstName'}>First Name</Label>
        <Input
          id="firstName"
          name="firstName"
          type="text"
          defaultValue={firstName}
          className={cn(styles.input)}
          aria-required="true"
          ref={register({ required: true })}
        />
        {errors.firstName && (
          <p className={styles.error}>Please enter a valid name</p>
        )}
      </div>
      <div className={styles.col2}>
        <Label htmlFor={'lastName'}>Last Name</Label>
        <Input
          id="lastName"
          name="lastName"
          type="text"
          defaultValue={lastName}
          className={cn(styles.input)}
          aria-required="true"
          ref={register({ required: true })}
        />
        {errors.lastName && (
          <p className={styles.error}>Please enter a valid name</p>
        )}
      </div>
      <div className={styles.col1}>
        <Label htmlFor={'netid'}>NetID</Label>
        <Input
          name="netid"
          id="netid"
          type="text"
          defaultValue={netId}
          className={cn(styles.input)}
          aria-required="true"
          ref={register({ required: true })}
        />
        {errors.netid && (
          <p className={styles.error}>Please enter a valid NetID</p>
        )}
      </div>

      <div className={styles.col2}>
        <Label htmlFor={'phoneNumber'}>Phone Number</Label>
        <Input
          name="phoneNumber"
          id="phoneNumber"
          type="tel"
          defaultValue={phone}
          min={10}
          max={10}
          aria-required="true"
          className={cn(styles.input)}
          ref={register({
            required: true,
            pattern: /[0-9]{10}/,
            maxLength: 10,
            minLength: 10,
          })}
        />
        {formState.errors.phoneNumber && (
          <p className={styles.error}>Please enter a valid phone number </p>
        )}
      </div>
    </div>
  );
};

export default EmployeeInfo;
