import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ModalPageProps } from '../../Modal/types';
import styles from '../ridemodal.module.css';
import { Label, Input, Button } from '../../FormElements/FormElements';
import { useReq } from '../../../context/req';

const DriverPage = ({ onBack, onSubmit, formData }: ModalPageProps) => {
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      driver: formData?.driver ?? '',
    },
  });
  const { errors } = formState;
  const { withDefaults } = useReq();
  const [loaded, setLoaded] = useState(false);

  const { date, pickupTime: startTime, dropoffTime: endTime } = formData!;
  type DriverOption = { id: string; firstName: string; lastName: string };
  const [availableDrivers, setAvailableDrivers] = useState<DriverOption[]>([]);

  useEffect(() => {
    if (startTime && endTime && date) {
      fetch(
        `/api/drivers/available?date=${date}&startTime=${startTime}&endTime=${endTime}`,
        withDefaults()
      )
        .then((res) => res.json())
        .then((data) => {
          setAvailableDrivers(
            [{ id: 'None', firstName: 'None', lastName: 'None' }].concat(
              data.data
            )
          );
          setLoaded(true);
        });
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.inputContainer}>
        <div className={styles.drivers}>
          {loaded ? (
            availableDrivers.map((d) => (
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
            ))
          ) : (
            <p>Loading...</p>
          )}
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
