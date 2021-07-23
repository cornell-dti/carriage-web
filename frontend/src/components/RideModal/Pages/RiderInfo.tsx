import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import { ObjectType, Location, Rider } from '../../../types';
import { ModalPageProps } from '../../Modal/types';
import { Button, Input, Label } from '../../FormElements/FormElements';
import styles from '../ridemodal.module.css';
import { useReq } from '../../../context/req';
import { useRiders } from '../../../context/RidersContext';

const RiderInfoPage = ({ formData, onBack, onSubmit }: ModalPageProps) => {
  const { register, handleSubmit, formState, getValues } = useForm({
    defaultValues: {
      name: formData?.rider ?? '',
      pickupLoc: formData?.pickupLoc ?? '',
      dropoffLoc: formData?.dropoffLoc ?? '',
    },
  });
  const { errors } = formState;
  const [nameToId, setNameToId] = useState<ObjectType>({});
  const [locationToId, setLocationToId] = useState<ObjectType>({});
  const { withDefaults } = useReq();
  const locations = Object.keys(locationToId).sort();
  const { riders } = useRiders();

  const beforeSubmit = ({ name, pickupLoc, dropoffLoc }: ObjectType) => {
    const rider = nameToId[name.toLowerCase()];
    const startLocation = locationToId[pickupLoc] ?? pickupLoc;
    const endLocation = locationToId[dropoffLoc] ?? dropoffLoc;
    onSubmit({ rider, startLocation, endLocation });
  };

  useEffect(() => {
    const nameToIdObj = riders.reduce((acc: ObjectType, r: Rider) => {
      const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
      acc[fullName] = r.id;
      return acc;
    }, {});
    setNameToId(nameToIdObj);

    fetch('/api/locations?active=true', withDefaults())
      .then((res) => res.json())
      .then(({ data }: { data: Location[] }) => {
        const locationToIdObj = data.reduce((acc: ObjectType, l) => {
          acc[l.name] = l.id;
          return acc;
        }, {});
        setLocationToId(locationToIdObj);
      });
  }, [withDefaults, riders]);

  return (
    <form onSubmit={handleSubmit(beforeSubmit)} className={styles.form}>
      <div className={cn(styles.inputContainer, styles.rider)}>
        <div className={styles.name}>
          <Label htmlFor={'name'}>Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            className={styles.nameInput}
            list="names"
            ref={register({
              required: true,
              validate: (name: string) =>
                nameToId[name.toLowerCase()] !== undefined,
            })}
          />
          {errors.name && <p className={styles.error}>Rider not found</p>}
          <datalist id="names">
            {riders.map((r) => (
              <option key={r.id}>
                {r.firstName} {r.lastName}
              </option>
            ))}
          </datalist>
        </div>
        <div className={styles.pickupLocation}>
          <Label htmlFor={'pickupLoc'} className={styles.label}>
            Pickup Location
          </Label>
          <Input
            id="pickupLoc"
            name="pickupLoc"
            type="text"
            list="locations"
            ref={register({ required: true })}
          />
          {errors.pickupLoc && (
            <p className={styles.error}>Please enter a location</p>
          )}
          <datalist id="locations">
            {locations.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </datalist>
        </div>
        <div className={styles.dropoffLocation}>
          <Label htmlFor={'dropoffLoc'} className={styles.label}>
            Dropoff Location
          </Label>
          <Input
            id="dropoffLoc"
            name="dropoffLoc"
            type="text"
            list="locations"
            ref={register({
              required: true,
              validate: (dropoffLoc) => {
                const pickupLoc = getValues('pickupLoc');
                return pickupLoc !== dropoffLoc;
              },
            })}
          />
          {errors.dropoffLoc?.type === 'required' && (
            <p className={styles.error}>Please enter a location</p>
          )}
          {errors.dropoffLoc?.type === 'validate' && (
            <p className={styles.error}>Locations cannot match</p>
          )}
          <datalist id="locations">
            {locations.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </datalist>
        </div>
      </div>
      <div className={styles.btnContainer}>
        <Button outline type="button" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">
          {formData?.rider ? 'Edit Ride' : 'Add a Ride'}
        </Button>
      </div>
    </form>
  );
};

export default RiderInfoPage;
