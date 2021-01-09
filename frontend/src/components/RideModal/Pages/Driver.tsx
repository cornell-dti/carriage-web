import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import axios from 'axios';
import { ModalPageProps } from '../../Modal/types';
import styles from '../ridemodal.module.css';
import { Driver } from '../../../types/index';
import { Label, Input, Button } from '../../FormElements/FormElements';

const DriverPage = ({ onBack, onSubmit, formData }: ModalPageProps) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      driver: formData?.driver ?? '',
    },
  });
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    axios.get('/api/drivers')
      .then(({ data }) => setDrivers(data.data));
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
      <div className={styles.btnContainer}>
        <Button outline type="button" onClick={onBack}>Back</Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
};

export default DriverPage;
