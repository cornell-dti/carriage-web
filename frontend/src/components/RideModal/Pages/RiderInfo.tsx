import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import { ObjectType } from '../../../types';
import { RiderType } from '@carriage-web/shared/types/rider';
import { ModalPageProps } from '../../Modal/types';
import {
  Button,
  Input,
  Label,
  SelectComponent,
} from '../../FormElements/FormElements';
import { useRiders } from '../../../context/RidersContext';
import { useLocations } from '../../../context/LocationsContext';

interface FormData {
  name: string;
  pickupLoc: string;
  dropoffLoc: string;
}

const RiderInfoPage = ({ formData, onBack, onSubmit }: ModalPageProps) => {
  const {
    control,
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
    const nameToIdObj = riders.reduce((acc: ObjectType, r: RiderType) => {
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
    <form onSubmit={handleSubmit(beforeSubmit)} form}>
      <div className={cn(inputContainer, rider)}>
        <div name}>
          <Label htmlFor={'name'}>Name</Label>
          {/* <Input
            id="name"
            type="text"
            nameInput}
            list="names"
            aria-required="true"
            {...register('name', {
              required: true,
              validate: (name: string) =>
                nameToId[name.toLowerCase()] !== undefined,
            })}
          /> */}
          <SelectComponent<FormData>
            name="name"
            datalist={Object.entries(nameToId).map(([name, id]) => ({
              id,
              name,
            }))}
            isSearchable={true}
            control={control}
            rules={{ required: 'Rider name is required' }}
          />

          {errors.name && <p error}>Rider not found</p>}
          <datalist id="names">
            {riders.map((r) => (
              <option key={r.id}>
                {r.firstName} {r.lastName}
              </option>
            ))}
          </datalist>
        </div>
        <div pickupLocation}>
          <Label htmlFor={'pickupLoc'} label}>
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
            <p error}>Please enter a location</p>
          )}
          <datalist id="locations">
            {locations.map((l) => (
              <option key={l.id}>{l.name}</option>
            ))}
          </datalist>
        </div>
        <div dropoffLocation}>
          <Label htmlFor={'dropoffLoc'} label}>
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
            <p error}>Please enter a location</p>
          )}
          {errors.dropoffLoc?.type === 'validate' && (
            <p error}>Locations cannot match</p>
          )}
          <datalist id="locations">
            {locations.map((l) => (
              <option key={l.id}>{l.name}</option>
            ))}
          </datalist>
        </div>
      </div>
      <div btnContainer}>
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
