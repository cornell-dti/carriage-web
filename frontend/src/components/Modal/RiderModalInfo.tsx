import React from "react";
import { useForm } from "react-hook-form";
import cn from "classnames";
import { Button, Input, SRLabel } from "../FormElements/FormElements";
import styles from "./ridermodal.module.css";
import { ObjectType, Accessibility } from "../../types/index";

type ModalFormProps = {
  onSubmit: (data: ObjectType) => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  formData?: ObjectType;
  setFormData: React.Dispatch<React.SetStateAction<ObjectType>>
};

const RiderModalInfo = ({ onSubmit, setIsOpen, setFormData }: ModalFormProps) => {
  const { register, errors, handleSubmit, getValues } = useForm();
  const beforeSubmit = ({
    name,
    netid,
    phoneNumber,
    needs,
    address,
    joinDate,
    endDate,
  }: ObjectType) => {
    const email = `${netid}@cornell.edu`;
    const splitName = name.split(" ");
    const firstName = splitName[0];
    const lastName = splitName[1];
    const accessibility = needs.split(",").map((n: string) => n.trim());
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
  }

  return (
    <form onSubmit={handleSubmit(beforeSubmit)} className={styles.form}>
      <div className={cn(styles.inputContainer, styles.rideTime)}>
        <div className={cn(styles.gridR1, styles.gridCSmall1)}>
          <SRLabel htmlFor='name'>Name: </SRLabel>
          <Input
            id='name'
            name="name"
            type="text"
            placeholder="Name"
            ref={register({ required: true, pattern: /^[a-zA-Z]+\s[a-zA-Z]+/ })}
            className={styles.firstRow}
          />
          {errors.name && <p className={styles.error}>enter a valid name</p>}
        </div>
        <div className={cn(styles.gridR1, styles.gridCSmall2)}>
          <SRLabel htmlFor='netid'>NetID: </SRLabel>
          <Input
            id="netid"
            name="netid"
            type="text"
            placeholder="NetID"
            ref={register({ required: true, pattern: /^[a-zA-Z]+[0-9]+$/ })}
            className={styles.firstRow}
          />
          {errors.netid && <p className={styles.error}>enter a valid netid</p>}
        </div>
        <div className={cn(styles.gridR1, styles.gridCSmall3)}>
          <SRLabel htmlFor='phoneNumber'>Phone Number: </SRLabel>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="text"
            placeholder="Phone Number"
            ref={register({ required: true, pattern: /^[0-9]{10}$/ })}
            className={styles.firstRow}
          />
          {errors.phoneNumber && (
            <p className={styles.error}>enter a valid phone number</p>
          )}
        </div>
        <div className={cn(styles.gridR2, styles.gridCBig1)}>
          <SRLabel htmlFor='needs'>Needs: </SRLabel>
          <Input
            id="needs"
            name="needs"
            type="text"
            placeholder="Needs"
            ref={register({
              validate: (needs) => {
                if (needs === "") {
                  return true;
                }
                const needsArr = needs.split(",").map((n: string) => n.trim());
                const isValidNeed = (
                  acc: boolean, 
                  val: Accessibility
                ) => acc && Object.values(Accessibility).includes(val);
                return needsArr.reduce(isValidNeed, true);
              },
            })}
          />
          {errors.needs?.type === "validate" && (
            <p className={styles.error}>
              Invalid needs. You can enter 'Assistant', 'Crutches', or
              'Wheelchair'
            </p>
          )}
        </div>
        <div className={cn(styles.gridR2, styles.gridCBig2)}>
          <SRLabel htmlFor='address'>Address: </SRLabel>
          <Input
            id="address"
            name="address"
            type="text"
            placeholder="Address"
            ref={register({
              required: true,
              pattern: /^[a-zA-Z0-9\s,.'-]{3,}$/,
            })}
          />
          {errors.address && (
            <p className={styles.error}>Please enter an address</p>
          )}
        </div>
        <div className={cn(styles.gridR3, styles.gridCAll)}>
          <p>Duration</p>
          <div className={styles.lastRow}>
            <div>
              <SRLabel htmlFor='joinDate'>Join Date: </SRLabel>
              <Input
                id='joinDate'
                type="date"
                name="joinDate"
                ref={register({ required: true })}
                className={styles.riderDate}
              />
              {errors.joinDate && (
                <p className={styles.error}>Please enter a join date</p>
              )}
            </div>
            <p className={styles.to}>to</p>
            <div>
              <SRLabel htmlFor='endDate'>End Date: </SRLabel>
              <Input
                type="endDate"
                name="endDate"
                ref={register({
                  required: true,
                  validate: (endDate) => {
                    const joinDate = getValues("joinDate");
                    return joinDate < endDate;
                  },
                })}
                className={styles.riderDate}
              />
              {errors.end?.type === "required" && (
                <p className={styles.error}>Please enter an end date</p>
              )}
              {errors.end?.type === "validate" && (
                <p className={styles.error}>Invalid end time</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Button className={styles.cancel} outline={true} onClick={() => cancel()}>Cancel</Button>
      <Button type="submit" className={styles.submit}>Add a Student</Button>
    </form>
  );
};

export default RiderModalInfo;
