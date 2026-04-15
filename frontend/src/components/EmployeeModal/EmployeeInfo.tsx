import React from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import { Input, Label } from '../FormElements/FormElements';

// Helper function to strip non-digit characters from phone number
const stripPhoneFormatting = (value: string): string => {
  return value.replace(/\D/g, '');
};

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
    <div className="grid grid-cols-3 gap-2 w-full max-w-2xl mb-4">
      <div className="col-start-1">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          type="text"
          defaultValue={firstName}
          className={cn('max-w-full w-full box-border')}
          aria-required="true"
          {...register('firstName', { required: true })}
        />
        {errors.firstName && (
          <p className="text-[#eb0023] text-xs mt-1">
            Please enter a valid name
          </p>
        )}
      </div>
      <div className="col-start-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          type="text"
          defaultValue={lastName}
          className={cn('max-w-full w-full box-border')}
          aria-required="true"
          {...register('lastName', { required: true })}
        />
        {errors.lastName && (
          <p className="text-[#eb0023] text-xs mt-1">
            Please enter a valid name
          </p>
        )}
      </div>
      <div className="col-start-1">
        <Label htmlFor="netid">NetID</Label>
        <Input
          id="netid"
          type="text"
          defaultValue={netId}
          className={cn('max-w-full w-full box-border')}
          aria-required="true"
          {...register('netid', { required: true })}
        />
        {errors.netid && (
          <p className="text-[#eb0023] text-xs mt-1">
            Please enter a valid NetID
          </p>
        )}
      </div>
      <div className="col-start-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          type="tel"
          defaultValue={phone}
          aria-required="true"
          className={cn('max-w-full w-full box-border')}
          {...register('phoneNumber', {
            required: 'Phone number is required',
            setValueAs: (value: string) => stripPhoneFormatting(value || ''),
            validate: (value) => {
              if (!value || value.length !== 10) {
                return 'Format: 10 digits only (e.g. 1234567890, (123) 456-7890)';
              }
              return true;
            },
          })}
        />
        {errors.phoneNumber && (
          <p className="text-[#eb0023] text-xs mt-1">
            {errors.phoneNumber.message?.toString() ||
              'Please enter a valid phone number (10 digits)'}
          </p>
        )}
        <p className="text-xs text-[#666] mt-1 mb-0">
          Format: 10 digits only (e.g., 1234567890)
        </p>
      </div>
    </div>
  );
};

export default EmployeeInfo;
