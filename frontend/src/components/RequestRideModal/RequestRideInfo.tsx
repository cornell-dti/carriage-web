import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import addresser from 'addresser';
import moment from 'moment';
import { useReq } from '../../context/req';
import styles from './requestridemodal.module.css';
import { Location, Ride } from '../../types';
import { Label, Input } from '../FormElements/FormElements';
import CustomRepeatingRides from './CustomRepeatingRides';
import { RideModalType } from './types';
import { checkBounds, isTimeValid } from '../../util/index';
import { useLocations } from '../../context/LocationsContext';

type RequestRideInfoProps = {
  ride?: Ride;
  showRepeatingCheckbox: boolean;
  showRepeatingInfo: boolean;
  modalType: RideModalType;
};

const RequestRideInfo = ({
  ride,
  showRepeatingCheckbox,
  showRepeatingInfo,
  modalType,
}: RequestRideInfoProps) => {
  const { register, setError, formState, getValues, watch, setValue } =
    useFormContext();
  const { errors } = formState;
  const { withDefaults } = useReq();
  const [locations, setLocations] = useState<Location[]>([]);
  const [custom, setCustom] = useState(ride?.recurring || false);
  const watchRepeating = watch('recurring', ride?.recurring || false);
  const watchPickupCustom = watch('startLocation');
  const watchDropoffCustom = watch('endLocation');
  const shouldDisableStartDate =
    (ride?.parentRide && ride?.parentRide.type !== 'unscheduled') ||
    (ride && ride.type !== 'unscheduled');
  const loc = useLocations().locations;

  useEffect(() => {
    setLocations(loc);
  }, [loc]);

  useEffect(() => {
    if (ride) {
      const defaultStart =
        ride.startLocation.tag === 'custom' ? 'Other' : ride.startLocation.id;
      const defaultEnd =
        ride.endLocation.tag === 'custom' ? 'Other' : ride.endLocation.id;
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
      {((modalType === 'CREATE' && watchRepeating) ||
        modalType === 'EDIT_REGULAR' ||
        modalType === 'EDIT_SINGLE_RECURRING') && (
        <Label htmlFor={'startDate'} className={styles.largeLabel}>
          Date
        </Label>
      )}
      <div className={styles.box}>
        {modalType === 'EDIT_ALL_RECURRING' && (
          <Label className={styles.boldLabel} htmlFor="startDate">
            Starts
          </Label>
        )}
        <div className={styles.errorBox}>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            disabled={shouldDisableStartDate}
            className={cn(styles.input)}
            ref={register({
              required: true,
              validate: (startDate) => {
                const pickupTime = getValues('pickupTime');
                const notWeekend =
                  moment(startDate).day() !== 0 &&
                  moment(startDate).day() !== 6;
                if (pickupTime && notWeekend)
                  return (
                    isTimeValid(startDate, pickupTime) ||
                    "Can't schedule rides for less than 2 days from today"
                  );
                else return notWeekend || "Can't schedule rides on weekends";
              },
            })}
          />
          {errors.startDate && (
            <p className={styles.error}>{errors.startDate.message}</p>
          )}
        </div>
        {showRepeatingCheckbox && (
          <Label className={styles.boldLabel} htmlFor={'recurring'}>
            Repeating?
          </Label>
        )}
        {showRepeatingCheckbox && (
          <Input
            className={styles.recurring}
            type="checkbox"
            id="recurring"
            name="recurring"
            ref={register({ required: false })}
          />
        )}
      </div>
      {showRepeatingInfo && watchRepeating ? (
        <div>
          <div className={styles.box}>
            <Label className={styles.boldLabel} id="repeats">
              Repeats
            </Label>
            <div className={styles.radioBox}>
              <Input
                className={styles.whenRepeat}
                name="whenRepeat"
                id="daily"
                ref={register({ required: watchRepeating })}
                type="radio"
                value="daily"
                onChange={() => setCustom(false)}
              />
              <Label className={styles.label} htmlFor="daily">
                Daily
              </Label>
            </div>
            <div className={styles.radioBox}>
              <input
                className={styles.whenRepeat}
                name="whenRepeat"
                id="weekly"
                ref={register({ required: watchRepeating })}
                type="radio"
                value="weekly"
                onChange={() => setCustom(false)}
              />
              <Label className={styles.label} htmlFor="weekly">
                Weekly
              </Label>
            </div>
            <div className={styles.radioBox}>
              <input
                className={styles.whenRepeat}
                name="whenRepeat"
                id="custom"
                ref={register({ required: watchRepeating })}
                type="radio"
                value="custom"
                onChange={() => setCustom(true)}
              />
              <Label className={styles.label} htmlFor="custom">
                Custom
              </Label>
            </div>
            {errors.whenRepeat && (
              <p className={styles.error}>Please select a value</p>
            )}
          </div>
          {custom && watchRepeating ? (
            <CustomRepeatingRides ride={ride} />
          ) : null}
          <Label className={styles.boldLabel} htmlFor="endDate">
            Ends
          </Label>
          <Input
            className={styles.input}
            type={'date'}
            name="endDate"
            id="endDate"
            ref={register({
              required: getValues('repeating'),
              validate: (endDate: any) => {
                const startDate = getValues('startDate');
                const notWeekend =
                  moment(endDate).day() !== 0 && moment(endDate).day() !== 6;
                if (notWeekend)
                  return (
                    startDate < endDate ||
                    'End date must be after the start date'
                  );
                return false || "Can't schedule rides on weekend";
              },
            })}
          />
          {errors.endDate && (
            <p className={styles.error}>{errors.endDate.message}</p>
          )}
        </div>
      ) : null}
      <Label className={styles.largeLabel} id="pickupLabel">
        Pickup
      </Label>
      <div className={styles.box}>
        <div className={styles.errorBox}>
          <Label className={styles.label} id="pickupLocation">
            Location
          </Label>
          <select
            className={styles.input}
            name="startLocation"
            aria-labelledby="pickupLabel pickupLocations"
            ref={register({
              required: true,
              validate: (pickUpLocation: string) => {
                const dropOffLocation = getValues('endLocation');
                return (
                  dropOffLocation !== pickUpLocation ||
                  'Pick Up and Drop Off locations must be different'
                );
              },
            })}
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          {errors.startLocation && (
            <p className={styles.error}>{errors.startLocation.message}</p>
          )}
        </div>
        <div className={styles.errorBox}>
          <Label className={styles.label} id="pickupTime">
            Time
          </Label>
          <Input
            type="time"
            name="pickupTime"
            className={styles.input}
            aria-labelledby="pickupLabel pickupTime"
            ref={register({
              required: true,
              validate: (pickupTime: string) => {
                const startDate = getValues('startDate');
                const pickup = moment(`${startDate} ${pickupTime}`);
                if (startDate) {
                  if (!isTimeValid(startDate, pickupTime))
                    return "Can't schedule rides for less than 2 days from today";
                }
                return (
                  checkBounds(startDate, pickup) ||
                  'Rides must be scheduled for after 7:30 AM and before 10 PM for any particular day'
                );
              },
            })}
          />
          {errors.pickupTime && (
            <p className={styles.error}>{errors.pickupTime.message}</p>
          )}
        </div>
      </div>
      {watchPickupCustom === 'Other' ? (
        <div className={styles.box}>
          <Label className={styles.boldLabel} id="customPickup">
            Enter Pickup Location
          </Label>
          <Input
            className={cn(styles.input, styles.flexGrow)}
            aria-labelledby="customPickup"
            name="customPickup"
            type="text"
            ref={register({ required: watchPickupCustom === 'Other' })}
          />
          <Label className={styles.label} id="pickupCity">
            City
          </Label>
          <Input
            className={styles.input}
            aria-labelledby="customPickup pickupCity"
            name="pickupCity"
            type="text"
            defaultValue="Ithaca"
            maxLength={32}
            ref={register({ required: watchPickupCustom === 'Other' })}
          />
          <Label className={styles.label} id="pickupZip">
            Zip Code
          </Label>
          <Input
            className={styles.input}
            aria-labelledby="customPickup pickupZip"
            name="pickupZip"
            type="text"
            defaultValue="14853"
            pattern="[0-9]*"
            maxLength={10}
            ref={register({ required: watchDropoffCustom === 'Other' })}
          />
        </div>
      ) : null}
      <Label className={styles.largeLabel} id="dropoffLabel">
        Dropoff
      </Label>
      <div className={styles.box}>
        <div className={styles.errorBox}>
          <Label className={styles.label} id="dropoffLocation">
            Location
          </Label>
          <select
            className={styles.input}
            name="endLocation"
            aria-labelledby="dropoffLabel dropoffLocations"
            ref={register({
              required: true,
              validate: (endLocation: string) => {
                const startLoc = getValues('startLocation');
                return (
                  endLocation !== startLoc ||
                  (endLocation === 'Other' && startLoc === 'Other') ||
                  'Pick Up and Drop Off locations must be different'
                );
              },
            })}
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          {errors.endLocation && (
            <p className={styles.error}>{errors.endLocation.message}</p>
          )}
        </div>
        <div className={styles.errorBox}>
          <Label className={styles.label} id="dropoffTime">
            Time
          </Label>
          <Input
            type="time"
            name="dropoffTime"
            className={styles.input}
            aria-labelledby="dropoffLabel dropoffTime"
            ref={register({
              required: true,
              validate: (dropoffTime: string) => {
                const pickupTi = getValues('pickupTime');
                const startDate = getValues('startDate');
                const dropOff = moment(`${startDate} ${dropoffTime}`);
                if (dropoffTime > pickupTi)
                  return (
                    checkBounds(startDate, dropOff) ||
                    'Rides must be scheduled for after 7:30 AM and before 10 PM for any particular day'
                  );
                return 'Drop Off time must be after the Pick Up time';
              },
            })}
          />
          {errors.dropoffTime && (
            <p className={styles.error}>{errors.dropoffTime.message}</p>
          )}
        </div>
      </div>
      {watchDropoffCustom === 'Other' ? (
        <div className={styles.box}>
          <Label className={styles.boldLabel} id="customDropoff">
            Enter Dropoff Location
          </Label>
          <Input
            className={cn(styles.input, styles.flexGrow)}
            aria-labelledby="customDropoff"
            name="customDropoff"
            type="text"
            ref={register({ required: watchDropoffCustom === 'Other' })}
          />
          <Label className={styles.label} id="dropoffCity">
            City
          </Label>
          <Input
            className={styles.input}
            aria-labelledby="customDropoff dropoffCity"
            name="dropoffCity"
            type="text"
            defaultValue="Ithaca"
            maxLength={32}
            ref={register({ required: watchDropoffCustom === 'Other' })}
          />
          <Label className={styles.label} id="dropoffZip">
            Zip Code
          </Label>
          <Input
            className={styles.input}
            aria-labelledby="customDropoff dropoffZip"
            name="dropoffZip"
            type="text"
            defaultValue="14850"
            pattern="[0-9]*"
            maxLength={10}
            ref={register({ required: watchDropoffCustom === 'Other' })}
          />
        </div>
      ) : null}
    </div>
  );
};

export default RequestRideInfo;
