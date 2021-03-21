import React from 'react';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import { ModalPageProps } from '../../Modal/types';
import styles from '../ridemodal.module.css';
import { Label, Input, Button } from '../../FormElements/FormElements';
import { useDrivers } from '../../../context/DriversContext';

const DriverPage = ({ onBack, onSubmit, formData }: ModalPageProps) => {
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      driver: formData?.driver ?? '',
    },
  });
  const { drivers } = useDrivers();
  const { errors } = formState;
  const driverOptions = drivers
    .map(({ id, firstName }) => ({ id, firstName }))
    .concat([{ id: 'None', firstName: 'None' }]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.inputContainer} style={{ textAlign: 'center' }}>
        <div className={styles.drivers}>
          {driverOptions.map((d) => (
            <div className={styles.driver} key={d.id}>
              <Label htmlFor="driver" className={styles.driverLabel}>
                {d.firstName}
              </Label>
              <Input
                className={styles.driverRadio}
                name="driver"
                type="radio"
                value={d.id}
                ref={register({ required: true })}
              />
            </div>
          ))}
        </div>
        {errors.driver && (
          <p className={styles.error} style={{ marginTop: '0.5rem' }}>
            Please select a driver
          </p>
        )}
      </div>
      <div className={styles.btnContainer}>
        <Button outline type="button" onClick={onBack}>Back</Button>
        <Button type="submit">Next</Button>
      </div>
    </form >
  );
};

export default DriverPage;
