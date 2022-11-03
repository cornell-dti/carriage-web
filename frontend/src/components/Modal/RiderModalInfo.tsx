import React from 'react';
import { useForm } from 'react-hook-form';
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

const RiderModalInfo = ({
  onSubmit,
  setIsOpen,
  setFormData,
  rider,
}: ModalFormProps) => {
  const { register, formState, handleSubmit, getValues } = useForm({
    defaultValues: {
      firstName: rider?.firstName ?? '',
      lastName: rider?.lastName ?? '',
      netid: rider?.email.split('@')[0] ?? '',
      phoneNumber: rider?.phoneNumber ?? '',
      needs: rider?.accessibility ?? '', // if no needs, default is undefined
      address: rider?.address ?? '',
      joinDate: rider?.joinDate ?? '',
      endDate: rider?.endDate ?? '',
    },
  });
  const { errors } = formState;
  const beforeSubmit = ({
    firstName,
    lastName,
    netid,
    phoneNumber,
    needs,
    address,
    joinDate,
    endDate,
  }: ObjectType) => {
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

  return (
    <form onSubmit={handleSubmit(beforeSubmit)} className={styles.form}>
      <div className={cn(styles.inputContainer)}>
        <div className={cn(styles.gridR1, styles.gridCSmall1)}>
          <div>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              ref={register({ required: true })}
              placeholder="first name"
              className={styles.input}
            />
            {errors.firstName && (
              <p className={styles.error}>First name cannot be empty.</p>
            )}
          </div>
          
          <div>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              ref={register({ required: true })}
              placeholder="first name"
              className={styles.input}
            />
            {errors.lastName && (
              <p className={styles.error}>Please enter last name.</p>
            )}
          </div>

          <div>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              ref={register({ required: true, pattern: /^[0-9]{10}$/ })}
              placeholder="phone number"
              className={styles.input}
            />
            {errors.phoneNumber && (
              <p className={styles.error}>Please enter a valid phone number (without hyphens).</p>
            )}
          </div>
        </div>

        <div className={cn(styles.gridR1)}>
        <div>
            <Input
              id="netid"
              name="netid"
              type="text"
              ref={register({ required: true, pattern: /^[a-zA-Z]+[0-9]+$/ })}
              disabled={isStudentEditing}
              placeholder="net id"
              className={styles.input}
            />
            {errors.netid && (
              <p className={styles.error}>Please enter a valid NetId.</p>
            )}
          </div>

          <div>
            <select
              name="needs"
              ref={register({ required: true })}
              className={cn(styles.input)}
            >
              <option value="" disabled selected>
                Needs
              </option>
              {Object.values(Accessibility).map((value, index) => {
                return (
                  <option key={index} value={value}>
                    {value}
                  </option>
                );
              })}
            </select>
            {errors.needs?.type === 'validate' && (
              <p className={styles.error}>
                Please enter a need.
              </p>
            )}
          </div>

          <div>
            <Input
              id="address"
              name="address"
              type="text"
              ref={register({
                required: true,
                pattern: /^[a-zA-Z0-9\s,.'-]{3,}$/,
              })}
              className={cn(styles.address)}
              placeholder="address"
            />
            {errors.address && (
              <p className={styles.error}>Please enter a valid address</p>
            )}
          </div>
        </div>

        <Label className={styles.duration} htmlFor="joinDate">
          Duration
        </Label>

        <div className={cn(styles.gridR1)}>
          <div>
            <Input
              id="joinDate"
              type="date"
              name="joinDate"
              ref={register({ required: true })}
              disabled={isStudentEditing}
              className={styles.riderDate}
              placeholder="join date"
            />
            {errors.joinDate && (
              <p className={styles.error}>Please enter a valid join date</p>
            )}
          </div>

          <Label className={styles.to} htmlFor="joinDate">
            to
          </Label>

          <div>
            <Input
              id="endDate"
              type="date"
              name="endDate"
              ref={register({
                required: true,
                validate: (endDate) => {
                  const joinDate = getValues('joinDate');
                  return joinDate < endDate;
                },
              })}
              disabled={isStudentEditing}
              className={styles.riderDate}
              placeholder="end date"
            />
            {errors.endDate?.type === 'required' && (
              <p className={styles.error}>Please enter a valid end date</p>
            )}
            {errors.endDate?.type === 'validate' && (
              <p className={styles.error}>Please enter a valid end date</p>
            )}
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
          {isEditing ? 'Save' : 'Add a Student'}
        </Button>
      </div>
    </form>
  );
};

export default RiderModalInfo;
