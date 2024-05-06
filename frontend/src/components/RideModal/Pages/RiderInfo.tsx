import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import { ObjectType, Location, Rider } from '../../../types';
import { ModalPageProps } from '../../Modal/types';
import {
  Button,
  Input,
  Label,
  SelectComponent,
} from '../../FormElements/FormElements';
import styles from '../ridemodal.module.css';
import { useRiders } from '../../../context/RidersContext';
import { useLocations } from '../../../context/LocationsContext';

const RiderInfoPage = ({ formData, onBack, onSubmit }: ModalPageProps) => {
  const { control, register, handleSubmit, formState, getValues } = useForm({
    defaultValues: {
      name: formData?.rider ?? '',
      pickupLoc: formData?.pickupLoc ?? '',
      dropoffLoc: formData?.dropoffLoc ?? '',
    },
  });
  const { errors } = formState;
  const [nameToId, setNameToId] = useState<ObjectType>({});
  const [locationToId, setLocationToId] = useState<ObjectType>({});
  const { locations } = useLocations();
  const { riders } = useRiders();
  const beforeSubmit = ({ name, pickupLoc, dropoffLoc }: ObjectType) => {
    const startLocation = locationToId[pickupLoc] ?? pickupLoc;
    const endLocation = locationToId[dropoffLoc] ?? dropoffLoc;
    /**Payload needed because the form is registered to expect rider instead of name
     * If name passed straightaway it results in the database receiving an empty field for rider
     *
     */
    const payload = {
      rider: name,
      startLocation,
      endLocation,
    };
    console.log(payload);
    onSubmit(payload);
  };

  useEffect(() => {
    const nameToIdObj = riders.reduce((acc: ObjectType, r: Rider) => {
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
          {/* <Input
            id="name"
            name="name"
            type="text"
            className={styles.nameInput}
            list="names"
            aria-required="true"
            ref={register({
              required: true,
              validate: (name: string) =>
                nameToId[name.toLowerCase()] !== undefined,
            })}
          /> */}
          <SelectComponent
            name="name"
            datalist={Object.entries(nameToId).map(([name, id]) => ({
              id,
              name,
            }))}
            isSearchable={true}
            control={control}
            rules={{ required: 'Rider name is required' }}
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
          <SelectComponent
            name={'pickupLoc'}
            datalist={locations}
            isSearchable={true}
            control={control}
            rules={{ required: 'Pickup Location is required' }}
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
          <SelectComponent
            name="dropoffLoc"
            datalist={locations}
            isSearchable={true}
            control={control}
            rules={{ required: 'Dropoff Location is required' }}
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
