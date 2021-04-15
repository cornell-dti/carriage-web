import React from 'react';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import { Button, Input, Label, SRLabel } from '../FormElements/FormElements';
import styles from './ridermodal.module.css';
import { ObjectType } from '../../types/index';

type ModalFormProps = {
  onSubmit: (data: ObjectType) => void;
  formData?: ObjectType;
}

const RiderModalInfo = ({ onSubmit }: ModalFormProps) => {
  const { register, errors, handleSubmit } = useForm();
  const beforeSubmit = ({ name, netid, email, phoneNumber, needs,
    address, start, end }: ObjectType) => {
    const startDate = new Date(`${start}`).toISOString();
    const endDate = new Date(`${end}`).toISOString();
    const splitName = name.split(' ');
    const firstName = splitName[0];
    const lastName = splitName[1];
    const accessibilityNeeds = needs.split(',');
    onSubmit({
      id: netid,
      firstName,
      lastName,
      email,
      phoneNumber,
      accessibilityNeeds,
      address,
      startDate,
      endDate,
    });
  };
  return (
    <form onSubmit={handleSubmit(beforeSubmit)} className={styles.form}>
      <div className={cn(styles.inputContainer, styles.rideTime)}>
        <div className={cn(styles.gridR1, styles.gridC1)}>
        <SRLabel htmlFor={"name"}>Name</SRLabel>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Name"
            ref={register({ required: true, pattern: /^[a-zA-Z]+\s[a-zA-Z]+/ })}
          />
          {errors.name && 'enter a valid name'}
        </div>
        <div className={cn(styles.gridR1, styles.gridC2)}>
          <SRLabel htmlFor={"netid"}>NetID</SRLabel>
          <Input
            name="netid"
            id="netid"
            type="text"
            placeholder="NetID"
            ref={register({ required: true, pattern: /^[a-zA-Z]+[0-9]+$/ })}
          />
          {errors.netid && 'enter a valid netid'}
        </div>
        <div className={cn(styles.gridR2, styles.gridC1)}>
        <SRLabel htmlFor={"email"}>Email</SRLabel>
          <Input
            id="email"
            name="email"
            type="text"
            placeholder="Email"
            ref={register({ required: true, pattern: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/ })}
          />
          {errors.email && 'enter a valid email'}
        </div>
        <div className={cn(styles.gridR2, styles.gridC2)}>
        <SRLabel htmlFor={"phoneNumber"}>Phone Number</SRLabel>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="text"
            placeholder="Phone Number"
            ref={register({ required: true, pattern: /^[0-9]{10}$/ })}
          />
          {errors.phoneNumber && 'enter a valid phone number'}
        </div>
        <div className={cn(styles.gridR3, styles.gridC1)}>
        <SRLabel htmlFor={"needs"}>Phone Number</SRLabel>
          <Input
            id="needs"
            name="needs"
            type="text"
            placeholder="Needs"
            ref={register({ required: true })}
          />
          {errors.needs && 'enter some needs'}
        </div>
        <div className={cn(styles.gridR3, styles.gridC2)}>
        <SRLabel htmlFor={"address"}>Phone Number</SRLabel>
          <Input
            id="address"
            name="address"
            type="text"
            placeholder="Address"
            ref={register({ required: true })}
          />
          {errors.address && 'enter an address'}
        </div>
        <div className={cn(styles.gridR4, styles.gridC1)}>
          <Label htmlFor="start">Start Date:</Label>
          <Input
            id="start"
            type="date"
            name="start"
            ref={register({ required: true })}
          />
        </div>
        <div className={cn(styles.gridR4, styles.gridC2)}>
          <Label htmlFor="end">End Date:</Label>
          <Input
            id="end"
            type="date"
            name="end"
            ref={register({ required: true })}
          />
        </div>
      </div>
      <Button type="submit">Add a Rider</Button>
    </form>
  );
};

export default RiderModalInfo;
