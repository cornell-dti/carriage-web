import React from 'react';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import { ModalPageProps } from '../../Modal/types';
import styles from '../ridemodal.module.css';
import { Label, Input, Button } from '../../FormElements/FormElements';
import { useEmployees } from '../../../context/EmployeesContext';

const DriverPage = ({ onBack, onSubmit, formData }: ModalPageProps) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      driver: formData?.driver ?? '',
    },
  });
  const { drivers } = useEmployees();
  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={cn(styles.inputContainer, styles.drivers)}>
        {drivers.map((d) => (
          <div className={styles.driver} key={d.id}>
            <Label htmlFor={d.firstName + d.lastName} className={styles.driverLabel}>
              {d.firstName}
            </Label>
            <Input
              id={d.firstName + d.lastName}
              className={styles.driverRadio}
              name="driver"
              type="radio"
              value={d.id}
              ref={register()}
            />
          </div>
        ))}
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
