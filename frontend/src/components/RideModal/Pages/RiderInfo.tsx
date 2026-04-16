import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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

const errorClass = 'text-[#dc3545] text-[0.8rem] mt-1 max-w-48';

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
    <form onSubmit={handleSubmit(beforeSubmit)} className="flex flex-col w-full h-full">
      <div className="mb-6 w-full">
        <div>
          <Label htmlFor={'name'}>Name</Label>
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

          {errors.name && <p className={errorClass}>Rider not found</p>}
          <datalist id="names">
            {riders.map((r) => (
              <option key={r.id}>
                {r.firstName} {r.lastName}
              </option>
            ))}
          </datalist>
        </div>
        <div>
          <Label htmlFor={'pickupLoc'} className="block mb-2 font-semibold text-[#333]">
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
            <p className={errorClass}>Please enter a location</p>
          )}
          <datalist id="locations">
            {locations.map((l) => (
              <option key={l.id}>{l.name}</option>
            ))}
          </datalist>
        </div>
        <div>
          <Label htmlFor={'dropoffLoc'} className="block mb-2 font-semibold text-[#333]">
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
            <p className={errorClass}>Please enter a location</p>
          )}
          {errors.dropoffLoc?.type === 'validate' && (
            <p className={errorClass}>Locations cannot match</p>
          )}
          <datalist id="locations">
            {locations.map((l) => (
              <option key={l.id}>{l.name}</option>
            ))}
          </datalist>
        </div>
      </div>
      <div className="flex justify-between mt-auto max-[500px]:flex-col max-[500px]:gap-4">
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
