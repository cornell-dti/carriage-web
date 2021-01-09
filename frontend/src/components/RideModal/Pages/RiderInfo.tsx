import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import axios from 'axios';
import { ObjectType, Rider, Location } from '../../../types';
import { ModalPageProps } from '../../Modal/types';
import { Button, Input } from '../../FormElements/FormElements';
import styles from '../ridemodal.module.css';

const RiderInfoPage = ({ onBack, onSubmit }: ModalPageProps) => {
  const { register, handleSubmit } = useForm();
  const [nameToId, setNameToId] = useState<ObjectType>({});
  const [locationToId, setLocationToId] = useState<ObjectType>({});
  const locations = Object.keys(locationToId).sort();

  const beforeSubmit = ({ name, pickupLoc, dropoffLoc }: ObjectType) => {
    const rider = nameToId[name.toLowerCase()];
    const startLocation = locationToId[pickupLoc] ?? pickupLoc;
    const endLocation = locationToId[dropoffLoc] ?? dropoffLoc;
    onSubmit({ rider, startLocation, endLocation });
  };

  useEffect(() => {
    axios.get('/api/riders')
      .then((res) => {
        const { data }: { data: Rider[] } = res.data;
        const nameToIdObj = data.reduce((acc: ObjectType, r) => {
          const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
          acc[fullName] = r.id;
          return acc;
        }, {});
        setNameToId(nameToIdObj);
      });

    axios.get('/api/locations')
      .then((res) => {
        const { data }: { data: Location[] } = res.data;
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
            className={styles.nameInput}
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
            {locations.map((l) => (
              l === 'Custom' ? null : <option key={l}>{l}</option>
            ))}
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
            {locations.map((l) => (
              l === 'Custom' ? null : <option key={l}>{l}</option>
            ))}
          </datalist>
        </div>
      </div>
      <div className={styles.btnContainer}>
        <Button outline type="button" onClick={onBack}>Back</Button>
        <Button type="submit">Add a Ride</Button>
      </div>
    </form>
  );
};

export default RiderInfoPage;
