import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import { useReq } from '../../../context/req';
import { ModalPageProps } from '../../Modal/types';
import styles from '../ridemodal.module.css';
import { Driver } from '../../../types/index';
import { Label, Input, Button } from '../../FormElements/FormElements';

const DriverPage = ({ onBack, onSubmit, formData }: ModalPageProps) => {
  const { register, formState, handleSubmit } = useForm({
    defaultValues: {
      driver: formData?.driver ?? '',
    },
  });
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const { withDefaults } = useReq();
  const { errors } = formState;

  useEffect(() => {
    fetch('/api/drivers', withDefaults())
      .then((res) => res.json())
      .then(({ data }) => setDrivers(data));
  }, [withDefaults]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div style={{ textAlign: 'center' }}>
        {errors.driver && <p className={styles.error}>Please select a driver</p>}
        <div className={cn(styles.inputContainer, styles.drivers)}>
          {drivers.map((d) => (
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
      </div>
      <div className={styles.btnContainer}>
        <Button outline type="button" onClick={onBack}>Back</Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
};

export default DriverPage;
