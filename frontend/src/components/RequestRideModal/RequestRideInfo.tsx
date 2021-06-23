import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import addresser from 'addresser';
import { useReq } from '../../context/req';
import styles from './requestridemodal.module.css';
import { Location, Ride } from '../../types';
import { Label, Input } from '../FormElements/FormElements';
import CustomRepeatingRides from './CustomRepeatingRides';
import {RideModalType} from './RequestRideModal';

type RequestRideInfoProps = {
  ride?: Ride;
  showRepeatingCheckbox: boolean;
  showRepeatingInfo: boolean;
  modalType: RideModalType;
}

const RequestRideInfo = ({ ride, showRepeatingCheckbox, 
  showRepeatingInfo, modalType }: RequestRideInfoProps) => {
  const { register, formState, getValues, watch, setValue } = useFormContext();
  const { errors } = formState;
  const { withDefaults } = useReq();
  const [locations, setLocations] = useState<Location[]>([]);
  const [custom, setCustom] = useState(ride?.recurring || false);
  const watchRepeating = watch('recurring', ride?.recurring || false);
  const watchPickupCustom = watch('startLocation');
  const watchDropoffCustom = watch('endLocation');

  useEffect(() => {
    const getExistingLocations = async () => {
      const locationsData = await fetch('/api/locations?active=true', withDefaults())
        .then((res) => res.json())
        .then((data) => data.data);
      const sortedLocations = locationsData.sort((a: Location, b: Location) => {
        if (a.name < b.name) { return -1; }
        if (a.name > b.name) { return 1; }
        return 0;
      });
      // Logic to prevent the other from being the default value
      sortedLocations.push({ id: 'Other', name: 'Other', address: 'custom, do not use' });
      setLocations(sortedLocations);
    };
    getExistingLocations();
  }, [withDefaults]);

  useEffect(() => {
    if (ride) {
      const defaultStart = ride.startLocation.tag === 'custom' ? 'Other' : ride.startLocation.id;
      const defaultEnd = ride.endLocation.tag === 'custom' ? 'Other' : ride.endLocation.id;
      setValue('startLocation', defaultStart);
      setValue('endLocation', defaultEnd);
    }
  }, [locations, ride, setValue]);

  useEffect(() => {
    if (ride) {
      if (watchPickupCustom === 'Other') {
        const pickup = addresser.parseAddress(ride!.startLocation.address);
        setValue('customPickup', pickup.addressLine1);
        setValue('pickupCity', pickup.placeName);
        setValue('pickupZip', pickup.zipCode);
      }
      if (watchDropoffCustom === 'Other') {
        const dropoff = addresser.parseAddress(ride!.endLocation.address);
        setValue('customDropoff', dropoff.addressLine1);
        setValue('dropoffCity', dropoff.placeName);
        setValue('dropoffZip', dropoff.zipCode);
      }
    }
  }, [watchPickupCustom, watchDropoffCustom, ride, setValue]);

  return (
    <div>
      {((modalType === 'CREATE' && watchRepeating) || modalType === 'EDIT_REGULAR' || modalType === 'EDIT_SINGLE_RECURRING') && <Label htmlFor={'startDate'} className={styles.largeLabel}>Date</Label>}
      <div className={styles.box}>
        {(modalType === 'EDIT_ALL_RECURRING') && <Label className={styles.boldLabel} htmlFor="startDate">Starts</Label>}
        <div className={styles.errorBox}>
          <Input
            id='startDate'
            name='startDate'
            type='date'
            className={cn(styles.input)}
            ref={register({ required: true })}
          />
          {errors.startDate && <p className={styles.error}>
            Please enter a valid start date</p>}
        </div>
        {showRepeatingCheckbox && <Label className={styles.boldLabel}
          htmlFor={'recurring'}>Repeating?</Label>}
        {showRepeatingCheckbox && <Input
          className={styles.recurring}
          type="checkbox"
          id="recurring"
          name="recurring"
          ref={register({ required: false })} />}
      </div>
      {showRepeatingInfo && watchRepeating
        ? <div>
          <div className={styles.box}>
            <Label className={styles.boldLabel} id="repeats">Repeats</Label>
            <Input
              className={styles.whenRepeat}
              name="whenRepeat"
              id="daily"
              ref={register({ required: watchRepeating })}
              type="radio"
              value="daily"
              onChange={() => setCustom(false)} />
            <Label className={styles.label} htmlFor="daily">Daily</Label>
            <input
              className={styles.whenRepeat}
              name="whenRepeat"
              id="weekly"
              ref={register({ required: watchRepeating })}
              type="radio"
              value="weekly"
              onChange={() => setCustom(false)} />
            <Label className={styles.label} htmlFor="weekly">Weekly</Label>
            <input
              className={styles.whenRepeat}
              name="whenRepeat"
              id="custom"
              ref={register({ required: watchRepeating })}
              type="radio"
              value="custom"
              onChange={() => setCustom(true)} />
            <Label className={styles.label} htmlFor="custom">Custom</Label>
            {errors.whenRepeat && <p className={styles.error}>
              Please select a value</p>}
          </div>
          {custom && watchRepeating ? <CustomRepeatingRides ride={ride} /> : null}
          <Label className={styles.boldLabel} htmlFor="endDate">Ends</Label>
          <Input className={styles.input} type={'date'} name="endDate" id="endDate"
            ref=
            {register({
              required: getValues('repeating'),
              validate: (endDate: any) => {
                const startDate = getValues('startDate');
                return startDate < endDate;
              },
            })} />
          {errors.endDate && <p className={styles.error}>
            Please select a valid end date</p>}
        </div> : null}
      <Label className={styles.largeLabel} id="pickupLabel">Pickup</Label>
      <div className={styles.box}>
        <div className={styles.errorBox}>
          <Label className={styles.label} id="pickupLocation">Location</Label>
          <select className={styles.input} name="startLocation" aria-labelledby="pickupLabel pickupLocations"
            ref={register({ required: true })}
          >
            {locations.map((location) => (<option key={location.id}
              value={location.id}>{location.name}</option>))
            }
          </select>
          {errors.startLocation && <p className={styles.error}>
            Please select a valid location</p>}
        </div>
        <div className={styles.errorBox}>
          <Label className={styles.label} id="pickupTime">Time</Label>
          <Input
            type="time"
            name="pickupTime"
            className={styles.input}
            aria-labelledby="pickupLabel pickupTime"
            ref={register({ required: true })}
          />
          {errors.pickupTime && <p className={styles.error}>
            Please choose a valid pickup time</p>}
        </div>
      </div>
      {watchPickupCustom === 'Other'
        ? <div className={styles.box}>
          <Label className={styles.boldLabel} id="customPickup">Enter Pickup Location</Label>
          <Input className={cn(styles.input, styles.flexGrow)}
            aria-labelledby="customPickup"
            name="customPickup"
            type="text"
            ref={register({
              required: watchPickupCustom === 'Other',
            })} />
          <Label className={styles.label} id="pickupCity">City</Label>
          <Input className={styles.input}
            aria-labelledby="customPickup pickupCity"
            name="pickupCity"
            type="text"
            defaultValue="Ithaca"
            maxLength={32}
            ref={register({
              required: watchPickupCustom === 'Other',
            })} />
          <Label className={styles.label} id="pickupZip">Zip Code</Label>
          <Input className={styles.input}
            aria-labelledby="customPickup pickupZip"
            name="pickupZip"
            type="text"
            defaultValue="14853"
            pattern="[0-9]*"
            maxLength={10}
            ref={register({
              required: watchDropoffCustom === 'Other',
            })} />
        </div>
        : null}
      <Label className={styles.largeLabel} id="dropoffLabel">Dropoff</Label>
      <div className={styles.box}>
        <div className={styles.errorBox}>
          <Label className={styles.label} id="dropoffLocation">Location</Label>
          <select className={styles.input} name="endLocation"
            aria-labelledby="dropoffLabel dropoffLocations"
            ref={register({
              required: true,
              validate: (endLocation: string) => {
                const startLoc = getValues('startLocation');
                return endLocation !== startLoc || (endLocation === 'Other' && startLoc === 'Other');
              },
            })}>
            {locations.map((location) => (<option key={location.id}
              value={location.id}>{location.name}</option>))}
          </select>
          {errors.endLocation && <p className={styles.error}>
            Please select a valid dropoff location</p>}
        </div>
        <div className={styles.errorBox}>
          <Label className={styles.label} id="dropoffTime">Time</Label>
          <Input
            type="time"
            name="dropoffTime"
            className={styles.input}
            aria-labelledby="dropoffLabel dropoffTime"
            ref={register({
              required: true,
              validate: (dropoffTime: any) => {
                const dropoffTi = dropoffTime;
                const pickupTi = getValues('pickupTime');
                return dropoffTi > pickupTi;
              },
            })} />
          {errors.dropoffTime && <p className={styles.error}>
            Please choose a valid dropoff time</p>}
        </div>
      </div>
      {watchDropoffCustom === 'Other'
        ? <div className={styles.box}>
          <Label className={styles.boldLabel} id="customDropoff">Enter Dropoff Location</Label>
          <Input className={cn(styles.input, styles.flexGrow)}
            aria-labelledby="customDropoff"
            name="customDropoff"
            type="text"
            ref={register({
              required: watchDropoffCustom === 'Other',
            })} />
          <Label className={styles.label} id="dropoffCity">City</Label>
          <Input className={styles.input}
            aria-labelledby="customDropoff dropoffCity"
            name="dropoffCity"
            type="text"
            defaultValue="Ithaca"
            maxLength={32}
            ref={register({
              required: watchDropoffCustom === 'Other',
            })} />
          <Label className={styles.label} id="dropoffZip">Zip Code</Label>
          <Input className={styles.input}
            aria-labelledby="customDropoff dropoffZip"
            name="dropoffZip"
            type="text"
            defaultValue="14850"
            pattern="[0-9]*"
            maxLength={10}
            ref={register({
              required: watchDropoffCustom === 'Other',
            })} />
        </div>
        : null}
    </div>
  );
};

export default RequestRideInfo;
