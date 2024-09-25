import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import cn from 'classnames';
import { Button, Input, Label } from '../FormElements/FormElements';
import styles from './ridermodal.module.css';
import { ObjectType, Accessibility, Rider } from '../../types/index';

type ModalFormProps = {
  onSubmit: (data: ObjectType) => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFormData: React.Dispatch<React.SetStateAction<ObjectType>>;
  rider?: Rider;
};

type FormData = {
  firstName: string;
  lastName: string;
  netid: string;
  phoneNumber: string;
  needs: string;
  address: string;
  joinDate: string;
  endDate: string;
  otherNeeds?: string;
};

const RiderModalInfo: React.FC<ModalFormProps> = ({
  onSubmit,
  setIsOpen,
  setFormData,
  rider,
}) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm<FormData>({
    defaultValues: {
      firstName: rider?.firstName ?? '',
      lastName: rider?.lastName ?? '',
      netid: rider?.email.split('@')[0] ?? '',
      phoneNumber: rider?.phoneNumber ?? '',
      needs: rider?.accessibility ?? '',
      address: rider?.address ?? '',
      joinDate: rider?.joinDate ?? '',
      endDate: rider?.endDate ?? '',
    },
  });

  const beforeSubmit: SubmitHandler<FormData> = ({
    firstName,
    lastName,
    netid,
    phoneNumber,
    needs,
    address,
    joinDate,
    endDate,
  }) => {
    const email = netid ? `${netid}@cornell.edu` : undefined;
    const accessibility = needs;
    onSubmit({
      firstName,
      lastName,
      email,
      phoneNumber,
      accessibility,
      address,
      joinDate,
      endDate,
    });
  };

  const cancel = () => {
    setFormData({});
    setIsOpen(false);
  };

  const localUserType = localStorage.getItem('userType');
  const isEditing = rider !== undefined;
  const isStudentEditing = isEditing && localUserType === 'Rider';
  const [needsOption, setNeedsOption] = useState('');

  return (
    <form onSubmit={handleSubmit(beforeSubmit)} className={styles.form}>
      <div className={cn(styles.inputContainer, styles.rideTime)}>
        <div className={cn(styles.gridR1, styles.gridCSmall1)}>
          <Label className={styles.label} htmlFor="firstName">
            First Name:{' '}
          </Label>
          <Input
            id="firstName"
            {...register('firstName', { required: true })}
            type="text"
            aria-required="true"
            className={styles.firstRow}
          />
          {errors.firstName && (
            <p className={styles.error}>First name cannot be empty</p>
          )}
          <Label className={styles.label} htmlFor="lastName">
            Last Name:{' '}
          </Label>
          <Input
            id="lastName"
            {...register('lastName', { required: true })}
            type="text"
            className={styles.firstRow}
            aria-required="true"
          />
          {errors.lastName && (
            <p className={styles.error}>Last name cannot be empty</p>
          )}
        </div>
        <div className={cn(styles.gridR1, styles.gridCSmall2)}>
          <Label className={styles.label} htmlFor="netid">
            NetID:{' '}
          </Label>
          <Input
            id="netid"
            {...register('netid', {
              required: true,
              pattern: /^[a-zA-Z]+[0-9]+$/,
            })}
            type="text"
            disabled={isStudentEditing}
            className={styles.firstRow}
            aria-required="true"
          />
          {errors.netid && (
            <p className={styles.error}>NetId cannot be empty</p>
          )}
        </div>
        <div className={cn(styles.gridR1, styles.gridCSmall3)}>
          <Label className={styles.label} htmlFor="phoneNumber">
            Phone Number:{' '}
          </Label>
          <Input
            id="phoneNumber"
            {...register('phoneNumber', {
              required: true,
              pattern: /^[0-9]{10}$/,
            })}
            type="tel"
            className={styles.firstRow}
            aria-required="true"
          />
          {errors.phoneNumber && (
            <p className={styles.error}>Phone number is not valid</p>
          )}
        </div>
        <div className={cn(styles.gridR2, styles.gridCBig1)}>
          <Label className={styles.label} htmlFor="needs">
            Needs:{' '}
          </Label>
          <select
            id="needs"
            {...register('needs', { required: true })}
            aria-required="true"
            onChange={(e) => setNeedsOption(e.target.value)}
          >
            {Object.values(Accessibility).map((value, index) => (
              <option key={index} value={value}>
                {value}
              </option>
            ))}
          </select>
          {needsOption === 'Other' && (
            <Input
              id="otherNeeds"
              {...register('otherNeeds')}
              type="text"
              placeholder="Please Specify Needs"
            />
          )}
          {errors.needs?.type === 'validate' && (
            <p className={styles.error}>
              Invalid needs. You can enter 'Assistant', 'Crutches', or
              'Wheelchair'
            </p>
          )}
        </div>
        <div className={cn(styles.gridR2, styles.gridCBig2)}>
          <Label className={styles.label} htmlFor="address">
            Address:{' '}
          </Label>
          <Input
            id="address"
            {...register('address', {
              required: true,
              pattern: /^[a-zA-Z0-9\s,.'-]{3,}$/,
            })}
            type="text"
            aria-required="true"
          />
          {errors.address && (
            <p className={styles.error}>Please enter an address</p>
          )}
        </div>
        <div className={cn(styles.gridR3, styles.gridCAll)}>
          <p>Duration</p>
          <div className={styles.lastRow}>
            <div>
              <Label className={styles.label} htmlFor="joinDate">
                Join Date:{' '}
              </Label>
              <Input
                id="joinDate"
                {...register('joinDate', { required: true })}
                type="date"
                aria-required="true"
                disabled={isStudentEditing}
                className={styles.riderDate}
              />
              {errors.joinDate && (
                <p className={styles.error}>Please enter a join date</p>
              )}
            </div>
            <p className={styles.to}>to</p>
            <div>
              <Label className={styles.label} htmlFor="endDate">
                End Date:{' '}
              </Label>
              <Input
                id="endDate"
                {...register('endDate', {
                  required: true,
                  validate: (endDate) => {
                    const joinDate = getValues('joinDate');
                    return joinDate < endDate;
                  },
                })}
                type="date"
                aria-required="true"
                disabled={isStudentEditing}
                className={styles.riderDate}
              />
              {errors.endDate?.type === 'required' && (
                <p className={styles.error}>Please enter an end date</p>
              )}
              {errors.endDate?.type === 'validate' && (
                <p className={styles.error}>Invalid end time</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <Button
          type="button"
          className={styles.cancel}
          outline={true}
          onClick={() => cancel()}
        >
          Cancel
        </Button>
        <Button type="submit" className={styles.submit}>
          {isEditing ? 'Edit a Student' : 'Add a Student'}
        </Button>
      </div>
    </form>
  );
};

export default RiderModalInfo;
