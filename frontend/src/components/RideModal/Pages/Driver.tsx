import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ModalPageProps } from '../../Modal/types';
import styles from '../ridemodal.module.css';
import { Label, Button } from '../../FormElements/FormElements';
import axios from '../../../util/axios';

const DriverPage = ({ onBack, onSubmit, formData }: ModalPageProps) => {
  const { register, handleSubmit, formState, setValue } = useForm({
    defaultValues: {
      driver: formData?.driver ?? '',
    },
  });
  const { errors } = formState;
  const [loaded, setLoaded] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(formData?.driver ?? '');

  const { date, pickupTime: startTime, dropoffTime: endTime } = formData!;
  type DriverOption = {
    id: string;
    firstName: string;
    lastName: string;
    photoLink: string;
  };
  const [availableDrivers, setAvailableDrivers] = useState<DriverOption[]>([]);

  const selectDriver = (driverId: string) => {
    setValue('driver', driverId);
    setSelectedDriver(driverId);
  };

  useEffect(() => {
    if (startTime && endTime && date) {
      axios
        .get(
          `/api/drivers/available?date=${date}&startTime=${startTime}&endTime=${endTime}`
        )
        .then((res) => res.data)
        .then((data) => {
          setAvailableDrivers([
            { id: 'None', firstName: 'None', lastName: 'None' },
            ...data.data,
          ]);
          setLoaded(true);
        });
    }
  }, [startTime, endTime, date]);

  useEffect(() => {
    register('driver', { required: 'Please select a driver' });
  }, [register]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.inputContainer}>
        <div className={styles.drivers}>
          {loaded ? (
            availableDrivers.map((d) => (
              <div className={styles.driver} key={d.id}>
                <div className={styles.driverInfo}>
                  <Label
                    htmlFor={d.firstName + d.lastName}
                    className={styles.driverLabel}
                  >
                    <img
                      src={d.photoLink}
                      alt=""
                      className={styles.driverPhoto}
                    />
                    {`${d.firstName} ${d.lastName}`}
                  </Label>
                </div>
                <Button
                  className={
                    selectedDriver === d.id
                      ? styles.selectedButton
                      : styles.selectButton
                  }
                  onClick={() => selectDriver(d.id)}
                  type="button"
                >
                  {selectedDriver === d.id ? 'Selected' : 'Select'}
                </Button>
              </div>
            ))
          ) : (
            <p>Loading...</p>
          )}
        </div>
        {errors.driver && (
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
