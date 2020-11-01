import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import { ModalPageProps } from '../../Modal/types';
import styles from '../ridemodal.module.css';
import { Driver } from '../../../types/index';
import { Label, Input, Button } from '../../FormElements/FormElements';

const DriverPage = ({ onSubmit }: ModalPageProps) => {
  const { register, handleSubmit } = useForm();
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    fetch('/drivers')
      .then((res) => res.json())
      .then(({ data }) => setDrivers(data));
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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
      <Button type="submit">Next</Button>
    </form>
  );
};

export default DriverPage;
