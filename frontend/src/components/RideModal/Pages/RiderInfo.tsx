import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import { ObjectType, Location, Rider } from '../../../types';
import { ModalPageProps } from '../../Modal/types';
import { Button, Input, Label } from '../../FormElements/FormElements';
import styles from '../ridemodal.module.css';
import { useRiders } from '../../../context/RidersContext';
import { useLocations } from '../../../context/LocationsContext';

interface FormData {
  name: string;
  pickupLoc: string;
  dropoffLoc: string;
}

const RiderInfoPage = ({ formData, onBack, onSubmit }: ModalPageProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    defaultValues: {
      name: formData?.rider ?? '',
      pickupLoc: formData?.pickupLoc ?? '',
      dropoffLoc: formData?.dropoffLoc ?? '',
    },
  });
  const [nameToId, setNameToId] = useState<ObjectType>({});
  const [locationToId, setLocationToId] = useState<ObjectType>({});
  const { locations } = useLocations();
  const { riders } = useRiders();
  const filteredRiders = riders.filter((r) => r.active == true);

  const beforeSubmit = ({ name, pickupLoc, dropoffLoc }: FormData) => {
    const rider = nameToId[name.toLowerCase()];
    const startLocation = locationToId[pickupLoc] ?? pickupLoc;
    const endLocation = locationToId[dropoffLoc] ?? dropoffLoc;
    onSubmit({ rider, startLocation, endLocation });
  };

  useEffect(() => {
    const nameToIdObj = filteredRiders.reduce((acc: ObjectType, r: Rider) => {
      const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
      acc[fullName] = r.id;
      return acc;
    }, {});
    setNameToId(nameToIdObj);

    const locationToIdObj = locations.reduce((acc: ObjectType, l) => {
      acc[l.name] = l.id;
      return acc;
    }, {});
    setLocationToId(locationToIdObj);
  }, [riders, locations]);

  return (
    <form onSubmit={handleSubmit(beforeSubmit)} className={styles.form}>
      <div className={cn(styles.inputContainer, styles.rider)}>
        <div className={styles.name}>
          <Label htmlFor={'name'}>Name</Label>
          <Input
            id="name"
            type="text"
            className={styles.nameInput}
            list="names"
            aria-required="true"
            {...register('name', {
              required: true,
              validate: (name: string) =>
                nameToId[name.toLowerCase()] !== undefined,
            })}
          />
          {errors.name && <p className={styles.error}>Rider not found</p>}
          <datalist id="names">
            {/* people.filter((person) => person.name !== 'John') */}
            {/* {riders.filter((r) => (
              <option key={r.id}>
                {r.firstName} {r.lastName}
              </option>
            ))} */}
            {filteredRiders.map((r) => (
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
            type="text"
            list="locations"
            aria-required="true"
            {...register('pickupLoc', { required: true })}
          />
          {errors.pickupLoc && (
            <p className={styles.error}>Please enter a location</p>
          )}
          <datalist id="locations">
            {locations.map((l) => (
              <option key={l.id}>{l.name}</option>
            ))}
          </datalist>
        </div>
        <div className={styles.dropoffLocation}>
          <Label htmlFor={'dropoffLoc'} className={styles.label}>
            Dropoff Location
          </Label>
          <Input
            id="dropoffLoc"
            type="text"
            list="locations"
            aria-required="true"
            {...register('dropoffLoc', {
              required: true,
              validate: (dropoffLoc: string) => {
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
              <option key={l.id}>{l.name}</option>
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
