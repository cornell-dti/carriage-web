import React from 'react';
import { useForm } from 'react-hook-form';
import { ModalPageProps } from '../../Modal/types';
import styles from '../ridemodal.module.css';
import { Label, Input, Button } from '../../FormElements/FormElements';
import { useEmployees } from '../../../context/EmployeesContext';

const DriverPage = ({ onBack, onSubmit, formData }: ModalPageProps) => {
  const { register, handleSubmit, formState, getValues } = useForm({
    defaultValues: {
      driver: formData?.driver ?? '',
      date: formData?.date ?? '',
      startTime: formData?.startTime ?? '',
      endTime: formData?.endTime ?? '',
    },
  });
  const { errors } = formState;
  // const { drivers } = useEmployees();

  const { date, startTime, endTime } = getValues();
  type DriverOption = { id: string; firstName: string; lastName: string };
  let availableDrivers: DriverOption[] = [];
  if (startTime && endTime && date) {
    fetch(`/api/drivers/available/${date}/${startTime}/${endTime}`)
      .then((res) => res.json())
      .then((data) => {
        availableDrivers = data;
      });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.inputContainer}>
        <div className={styles.drivers}>
          {availableDrivers.map((d) => (
            <div className={styles.driver} key={d.id}>
              <Label
                htmlFor={d.firstName + d.lastName}
                className={styles.driverLabel}
              >
                {d.firstName}
              </Label>
              <Input
                id={d.firstName + d.lastName}
                className={styles.driverRadio}
                name="driver"
                type="radio"
                value={d.id}
                ref={register({ required: true })}
              />
            </div>
          ))}
        </div>
        {errors.driver?.type === 'required' && (
          <p className={styles.error} style={{ textAlign: 'center' }}>
            Please select a driver
          </p>
        )}
      </div>
      <div className={styles.btnContainer}>
        <Button outline type="button" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
};

export default DriverPage;
