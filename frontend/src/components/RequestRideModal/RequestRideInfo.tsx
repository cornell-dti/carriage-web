import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import addresser from 'addresser';
import moment from 'moment';
import styles from './requestridemodal.module.css';
import { RideType } from '@shared/types/ride';
import { LocationType } from '@shared/types/location';
import { Label, Input } from '../FormElements/FormElements';
import CustomRepeatingRides from './CustomRepeatingRides';
import { RideModalType } from './types';
import { checkBounds, isTimeValid } from '../../util/index';
import { useLocations } from '../../context/LocationsContext';
import RequestRideMap from '../RiderComponents/RequestRideMap';

type RequestRideInfoProps = {
  ride?: RideType;
  showRepeatingCheckbox: boolean;
  showRepeatingInfo: boolean;
  modalType: RideModalType;
};

type FormData = {
  startDate: string;
  recurring: boolean;
  whenRepeat: string;
  endDate: string;
  startLocation: string;
  pickupTime: string;
  customPickup?: string;
  pickupCity?: string;
  pickupZip?: string;
  endLocation: string;
  dropoffTime: string;
  customDropoff?: string;
  dropoffCity?: string;
  dropoffZip?: string;
};

const RequestRideInfo: React.FC<RequestRideInfoProps> = ({
  ride,
  showRepeatingCheckbox,
  showRepeatingInfo,
  modalType,
}) => {
  const {
    register,
    formState: { errors },
    getValues,
    watch,
    setValue,
  } = useFormContext<FormData>();
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [custom, setCustom] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<LocationType | null>(
    null
  );
  const [dropoffLocation, setDropoffLocation] = useState<LocationType | null>(
    null
  );
  const watchRepeating = watch('recurring', false);
  const watchPickupCustom = watch('startLocation');
  const watchDropoffCustom = watch('endLocation');
  const shouldDisableStartDate = ride && ride.schedulingState !== 'unscheduled';
  const loc = useLocations().locations;

  useEffect(() => {
    setLocations(loc);
  }, [loc]);

  useEffect(() => {
    if (ride) {
      const defaultStart =
        ride.startLocation.tag === 'custom'
          ? 'Other'
          : ride.startLocation.id ?? '';
      const defaultEnd =
        ride.endLocation.tag === 'custom' ? 'Other' : ride.endLocation.id ?? '';
      setValue('startLocation', defaultStart);
      setValue('endLocation', defaultEnd);
    }
  }, [locations, ride, setValue]);

  useEffect(() => {
    if (ride) {
      if (watchPickupCustom === 'Other') {
        const pickup = addresser.parseAddress(ride.startLocation.address);
        setValue('customPickup', pickup.addressLine1);
        setValue('pickupCity', pickup.placeName);
        setValue('pickupZip', pickup.zipCode);
      }
      if (watchDropoffCustom === 'Other') {
        const dropoff = addresser.parseAddress(ride.endLocation.address);
        setValue('customDropoff', dropoff.addressLine1);
        setValue('dropoffCity', dropoff.placeName);
        setValue('dropoffZip', dropoff.zipCode);
      }
    }
  }, [watchPickupCustom, watchDropoffCustom, ride, setValue]);

  // Handle pickup location selection from map
  const handlePickupSelect = (location: LocationType | null) => {
    setPickupLocation(location);
    if (location) {
      // Find the location in our locations list and set the form value
      const foundLocation = locations.find((loc) => loc.id === location.id);
      if (foundLocation) {
        setValue('startLocation', foundLocation.id);
      } else {
        // If it's a custom location, set to 'Other' and populate custom fields
        setValue('startLocation', 'Other');
        const parsed = addresser.parseAddress(location.address);
        setValue('customPickup', parsed.addressLine1);
        setValue('pickupCity', parsed.placeName);
        setValue('pickupZip', parsed.zipCode);
      }
    }
  };

  // Handle dropoff location selection from map
  const handleDropoffSelect = (location: LocationType | null) => {
    setDropoffLocation(location);
    if (location) {
      // Find the location in our locations list and set the form value
      const foundLocation = locations.find((loc) => loc.id === location.id);
      if (foundLocation) {
        setValue('endLocation', foundLocation.id);
      } else {
        // If it's a custom location, set to 'Other' and populate custom fields
        setValue('endLocation', 'Other');
        const parsed = addresser.parseAddress(location.address);
        setValue('customDropoff', parsed.addressLine1);
        setValue('dropoffCity', parsed.placeName);
        setValue('dropoffZip', parsed.zipCode);
      }
    }
  };

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
            type="date"
            disabled={shouldDisableStartDate}
            className={cn(styles.input)}
            aria-required="true"
            {...register('startDate', {
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
                else
                  return (
                    notWeekend ||
                    'Please enter a valid date. (Note: CULifts does not operate during weekends or university-wide breaks.)'
                  );
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
            {...register('recurring')}
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
                id="daily"
                {...register('whenRepeat', { required: watchRepeating })}
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
                id="weekly"
                {...register('whenRepeat', { required: watchRepeating })}
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
                id="custom"
                {...register('whenRepeat', { required: watchRepeating })}
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
            id="endDate"
            {...register('endDate', {
              required: getValues('recurring'),
              validate: (endDate: string) => {
                const startDate = getValues('startDate');
                const notWeekend =
                  moment(endDate).day() !== 0 && moment(endDate).day() !== 6;
                if (notWeekend)
                  return (
                    startDate < endDate ||
                    'End date must be after the start date'
                  );
                return (
                  false ||
                  'Please enter a valid date. (Note: CULifts does not operate during weekends or university-wide breaks.)'
                );
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
            aria-labelledby="pickupLabel pickupLocations"
            aria-required="true"
            {...register('startLocation', {
              required: true,
              validate: (pickUpLocation: string) => {
                const dropOffLocation = getValues('endLocation');
                return (
                  dropOffLocation !== pickUpLocation ||
                  'Please select a valid pickup location.'
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
            className={styles.input}
            aria-labelledby="pickupLabel pickupTime"
            aria-required="true"
            {...register('pickupTime', {
              required: true,
              validate: (pickupTime: string) => {
                const startDate = getValues('startDate');
                const pickup = moment(`${startDate} ${pickupTime}`);
                if (startDate) {
                  if (!isTimeValid(startDate, pickupTime))
                    return 'Please enter a valid date. (Note: CULifts does not operate during weekends or university-wide breaks.)';
                }
                return (
                  checkBounds(startDate, pickup) ||
                  'Please select a valid pickup time between 7:45 AM and 10:00 PM.'
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
            type="text"
            {...register('customPickup', {
              required: watchPickupCustom === 'Other',
            })}
          />
          <Label className={styles.label} id="pickupCity">
            City
          </Label>
          <Input
            className={styles.input}
            aria-labelledby="customPickup pickupCity"
            type="text"
            defaultValue="Ithaca"
            maxLength={32}
            {...register('pickupCity', {
              required: watchPickupCustom === 'Other',
            })}
          />
          <Label className={styles.label} id="pickupZip">
            Zip Code
          </Label>
          <Input
            className={styles.input}
            aria-labelledby="customPickup pickupZip"
            type="text"
            defaultValue="14853"
            pattern="[0-9]*"
            maxLength={10}
            {...register('pickupZip', {
              required: watchPickupCustom === 'Other',
            })}
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
            aria-labelledby="dropoffLabel dropoffLocations"
            aria-required="true"
            {...register('endLocation', {
              required: true,
              validate: (endLocation: string) => {
                const startLoc = getValues('startLocation');
                return (
                  endLocation !== startLoc ||
                  (endLocation === 'Other' && startLoc === 'Other') ||
                  'Please select a valid pickup location.'
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
            className={styles.input}
            aria-labelledby="dropoffLabel dropoffTime"
            aria-required="true"
            {...register('dropoffTime', {
              required: true,
              validate: (dropoffTime: string) => {
                const pickupTi = getValues('pickupTime');
                const startDate = getValues('startDate');
                const dropOff = moment(`${startDate} ${dropoffTime}`);
                if (dropoffTime > pickupTi)
                  return (
                    checkBounds(startDate, dropOff) ||
                    'Please select a valid pickup time between 7:45 AM and 10:00 PM.'
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

      {/* Map for location selection */}
      <div className={styles.mapSection}>
        <Label className={styles.largeLabel}>Select Locations on Map</Label>
        <div className={styles.mapContainer}>
          <RequestRideMap
            pickupLocation={pickupLocation}
            dropoffLocation={dropoffLocation}
            availableLocations={locations}
            onPickupSelect={handlePickupSelect}
            onDropoffSelect={handleDropoffSelect}
          />
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
            type="text"
            {...register('customDropoff', {
              required: watchDropoffCustom === 'Other',
            })}
          />
          <Label className={styles.label} id="dropoffCity">
            City
          </Label>
          <Input
            className={styles.input}
            aria-labelledby="customDropoff dropoffCity"
            type="text"
            defaultValue="Ithaca"
            maxLength={32}
            {...register('dropoffCity', {
              required: watchDropoffCustom === 'Other',
            })}
          />
          <Label className={styles.label} id="dropoffZip">
            Zip Code
          </Label>
          <Input
            className={styles.input}
            aria-labelledby="customDropoff dropoffZip"
            type="text"
            defaultValue="14850"
            pattern="[0-9]*"
            maxLength={10}
            {...register('dropoffZip', {
              required: watchDropoffCustom === 'Other',
            })}
          />
        </div>
      ) : null}
    </div>
  );
};

export default RequestRideInfo;
