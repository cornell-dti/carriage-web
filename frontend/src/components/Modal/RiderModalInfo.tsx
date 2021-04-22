import React from "react";
import { useForm } from "react-hook-form";
import cn from "classnames";
import { Button, Input } from "../FormElements/FormElements";
import styles from "./ridermodal.module.css";
import { ObjectType, Accessibility } from "../../types/index";

type ModalFormProps = {
  onSubmit: (data: ObjectType) => void;
  formData?: ObjectType;
};

const RiderModalInfo = ({ onSubmit }: ModalFormProps) => {
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

  return (
    <form onSubmit={handleSubmit(beforeSubmit)} className={styles.form}>
      <div className={cn(styles.inputContainer, styles.rideTime)}>
        <div className={cn(styles.gridR1, styles.gridCSmall1)}>
          <Input
            name="name"
            type="text"
            placeholder="Name"
            ref={register({ required: true, pattern: /^[a-zA-Z]+\s[a-zA-Z]+/ })}
            className={styles.firstRow}
          />
          {errors.name && <p className={styles.error}>enter a valid name</p>}
        </div>
        <div className={cn(styles.gridR1, styles.gridCSmall2)}>
          <Input
            name="netid"
            type="text"
            placeholder="NetID"
            ref={register({ required: true, pattern: /^[a-zA-Z]+[0-9]+$/ })}
            className={styles.firstRow}
          />
          {errors.netid && <p className={styles.error}>enter a valid netid</p>}
        </div>
        <div className={cn(styles.gridR1, styles.gridCSmall3)}>
          <Input
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
          <Input
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
          <Input
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
          <div style={{ display: "flex" }}>
            <div>
              <Input
                type="date"
                name="joinDate"
                ref={register({ required: true })}
                className={styles.riderDate}
              />
              {errors.joinDate && (
                <p className={styles.error}>Please enter a join date</p>
              )}
            </div>
            <p style={{ margin: "0 1rem" }}>to</p>
            <div>
              <Input
                type="date"
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
      <Button type="submit">Add a Student</Button>
    </form>
  );
};

export default RiderModalInfo;
