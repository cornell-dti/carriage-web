import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import { Button, Input, Label } from '../FormElements/FormElements';
import styles from './ridemodal.module.css';
import { ObjectType, Driver, Rider, Location } from '../../types/index';

type ModalFormProps = {
  onSubmit: (data: ObjectType) => void;
  formData?: ObjectType;
}

export const RideTimesPage = ({ onSubmit }: ModalFormProps) => {
  const { register, handleSubmit, getValues } = useForm();

  const beforeSubmit = ({ date, pickupTime, dropoffTime }: ObjectType) => {
    const startTime = new Date(`${date} ${pickupTime} EST`).toISOString();
    const endTime = new Date(`${date} ${dropoffTime} EST`).toISOString();
    onSubmit({ startTime, endTime });
  };

  return (
    <form onSubmit={handleSubmit(beforeSubmit)} className={styles.form}>
      <div className={cn(styles.inputContainer, styles.rideTime)}>
        <div className={styles.date}>
          <Label htmlFor="date">Date:</Label>
          <Input
            type="date"
            name="date"
            ref={register({ required: true })}
          />
        </div>
        <div className={styles.pickupTime}>
          <Label htmlFor="pickupTime">Pickup time:</Label>
          <Input
            type="time"
            name="pickupTime"
            ref={register({ required: true })}
          />
        </div>
        <div className={styles.dropoffTime}>
          <Label htmlFor="dropoffTime">Dropoff time:</Label>
          <Input
            type="time"
            name="dropoffTime"
            ref={register({
              required: true,
              validate: (dropoffTime) => {
                const pickupTime = getValues('pickupTime');
                return pickupTime < dropoffTime;
              },
            })}
          />
        </div>
      </div>
      <Button type="submit">Next</Button>
    </form >
  );
};

export const DriverPage = ({ onSubmit }: ModalFormProps) => {
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

export const RiderInfoPage = ({ onSubmit }: ModalFormProps) => {
  const { register, handleSubmit } = useForm();
  const [nameToId, setNameToId] = useState<ObjectType>({});
  const [locationToId, setLocationToId] = useState<ObjectType>([]);
  const locations = Object.keys(locationToId);

  const beforeSubmit = ({ name, pickupLoc, dropoffLoc }: ObjectType) => {
    const rider = nameToId[name.toLowerCase()];
    const startLocation = locationToId[pickupLoc] ?? pickupLoc;
    const endLocation = locationToId[dropoffLoc] ?? dropoffLoc;
    onSubmit({ rider, startLocation, endLocation });
  };

  useEffect(() => {
    fetch('/riders')
      .then((res) => res.json())
      .then(({ data }: { data: Rider[] }) => {
        const nameToIdObj = data.reduce((acc: ObjectType, r) => {
          const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
          acc[fullName] = r.id;
          return acc;
        }, {});
        setNameToId(nameToIdObj);
      });

    fetch('/locations')
      .then((res) => res.json())
      .then(({ data }: { data: Location[] }) => {
        const locationToIdObj = data.reduce((acc: ObjectType, l) => {
          acc[l.name] = l.id;
          return acc;
        }, {});
        setLocationToId(locationToIdObj);
      });
  }, []);

  return (
    <form onSubmit={handleSubmit(beforeSubmit)} className={styles.form}>
      <div className={cn(styles.inputContainer, styles.rider)}>
        <div className={styles.name}>
          <Input
            name="name"
            type="text"
            placeholder="Name"
            ref={register({
              required: true,
              validate: (name: string) => (
                nameToId[name.toLowerCase()] !== undefined
              ),
            })}
          />
        </div>
        <div className={styles.pickupLocation}>
          <Input
            name="pickupLoc"
            type="text"
            placeholder="Pickup Location"
            list="locations"
            ref={register({ required: true })}
          />
          <datalist id="locations">
            {locations.map((l) => <option key={l}>{l}</option>)}
          </datalist>
        </div>
        <div className={styles.dropoffLocation}>
          <Input
            name="dropoffLoc"
            type="text"
            placeholder="Dropoff Location"
            list="locations"
            ref={register({ required: true })}
          />
          <datalist id="locations">
            {locations.map((l) => <option key={l}>{l}</option>)}
          </datalist>
        </div>
      </div>
      <Button type="submit">Add a Ride</Button>
    </form>
  );
};
