import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import addresser from 'addresser';
import moment from 'moment';
import { Ride } from '../../../types';
import { RideModalType } from '../types';
import { Input } from '../../FormElements/FormElements';
import { checkBounds, isTimeValid } from '../../../util/index';
import { useLocations } from '../../../context/LocationsContext';
import RequestRideMap from '../../RiderComponents/RequestRideMap';
import { Location } from '../../../types';
import CustomTimePicker from '../CustomTimePicker';
import sharedStyles from '../requestridemodal.module.css';
import ownStyles from './locationstep.module.css';
const styles = { ...sharedStyles, ...ownStyles };

type DropoffLocationStepProps = {
  ride?: Ride;
  modalType: RideModalType;
  currentStep?: 'date' | 'pickup' | 'dropoff';
  onClose?: () => void;
  onNext?: () => void;
  onBack?: () => void;
};

const DropoffLocationStep: React.FC<DropoffLocationStepProps> = ({
  ride,
  modalType,
  currentStep = 'dropoff',
  onClose,
  onNext,
  onBack,
}) => {
  const {
    register,
    formState: { errors },
    getValues,
    watch,
    setValue,
    reset,
    trigger,
  } = useFormContext();

  const [locations, setLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showLocationButton, setShowLocationButton] = useState(false);
  const searchInputRef = useRef<HTMLDivElement>(null);
  const locationButtonRef = useRef<HTMLButtonElement>(null);
  const watchDropoffCustom = watch('endLocation');
  const watchCustomCheckbox = watch('customDropoffLocation', false);
  const watchEndLocation = watch('endLocation');
  const watchDropoffTime = watch('dropoffTime');
  const loc = useLocations().locations;

  // Derive selected location from form value — persists across Back navigation
  const dropoffLocation = loc.find((l) => l.id === watchEndLocation) ?? null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        locationButtonRef.current &&
        !locationButtonRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
        setShowLocationButton(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setLocations(loc);
    setFilteredLocations(loc);
  }, [loc]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter((location) =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [searchQuery, locations]);

  useEffect(() => {
    if (ride) {
      const defaultEnd =
        ride.endLocation.tag === 'custom' ? 'Other' : ride.endLocation.id ?? '';
      setValue('endLocation', defaultEnd);
    }
  }, [locations, ride, setValue]);

  useEffect(() => {
    if (ride && watchDropoffCustom === 'Other') {
      const dropoff = addresser.parseAddress(ride.endLocation.address);
      setValue('customDropoff', dropoff.addressLine1);
      setValue('dropoffCity', dropoff.placeName);
      setValue('dropoffZip', dropoff.zipCode);
    }
  }, [watchDropoffCustom, ride, setValue]);

  useEffect(() => {
    if (watchCustomCheckbox) {
      setValue('endLocation', 'Other');
      setSearchQuery('Other (Custom Address)');
    }
  }, [watchCustomCheckbox, setValue]);

  const handleDropoffSelect = (location: Location | null) => {
    if (location) {
      const foundLocation = locations.find((loc) => loc.id === location.id);
      if (foundLocation) {
        setValue('endLocation', foundLocation.id);
        setSearchQuery(foundLocation.name);
        setShowLocationDropdown(false);
        setShowLocationButton(false);
      } else {
        setValue('endLocation', 'Other');
        const parsed = addresser.parseAddress(location.address);
        setValue('customDropoff', parsed.addressLine1);
        setValue('dropoffCity', parsed.placeName);
        setValue('dropoffZip', parsed.zipCode);
      }
    }
  };

  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowLocationDropdown(true);
    if (value === '') {
      setValue('endLocation', '');
    }
  };

  const handleLocationSelect = (location: Location) => {
    setValue('endLocation', location.id);
    setSearchQuery(location.name);
    setShowLocationDropdown(false);
    setShowLocationButton(false);
  };

  // Check if form is valid for enabling "Save and Continue" button
  const isFormValid = useMemo(() => {
    const hasLocation =
      watchEndLocation &&
      watchEndLocation !== '' &&
      watchEndLocation !== undefined;
    const hasTime =
      watchDropoffTime &&
      watchDropoffTime !== '' &&
      watchDropoffTime !== undefined;

    // Basic validation - just check if both fields are filled
    // Let form validation handle more complex checks on submit
    return hasLocation && hasTime;
  }, [watchEndLocation, watchDropoffTime]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleSaveAndContinue = async () => {
    if (onNext) {
      await onNext();
    }
  };

  // Get selected location name for display
  const getSelectedLocationName = () => {
    if (watchEndLocation && watchEndLocation !== '') {
      if (watchEndLocation === 'Other') {
        return 'Other (Custom Address)';
      }
      const location = locations.find((loc) => loc.id === watchEndLocation);
      return location ? location.name : 'Select dropoff location';
    }
    return 'Select dropoff location';
  };

  return (
    <div className={styles.stepPage}>
      <div className={styles.topContent}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5L15 15" stroke="#ABABAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Top frame with dropoff location selection */}
        <div className={styles.pickupLocationFrame}>
          <div className={styles.pickupLocationTitle}>
            Select dropoff location:
          </div>

          {/* Location selection button */}
          <div className={styles.searchInputWrapper} ref={searchInputRef}>
            <button
              ref={locationButtonRef}
              type="button"
              className={styles.locationSelectButton}
              onClick={() => {
                setSearchQuery('');
                setShowLocationButton(true);
                setShowLocationDropdown(true);
              }}
            >
              <span
                className={
                  !watchEndLocation || watchEndLocation === ''
                    ? styles.locationButtonPlaceholder
                    : ''
                }
              >
                {getSelectedLocationName()}
              </span>
              <span className={styles.optionIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ transform: 'rotate(90deg)' }}
                >
                  <path
                    d="M9.20508 3C10.929 3 12.5823 3.68482 13.8013 4.90381C15.0203 6.12279 15.7051 7.77609 15.7051 9.5C15.7051 11.11 15.1151 12.59 14.1451 13.73L14.4151 14H15.2051L20.2051 19L18.7051 20.5L13.7051 15.5V14.71L13.4351 14.44C12.2951 15.41 10.8151 16 9.20508 16C7.48117 16 5.82787 15.3152 4.60888 14.0962C3.3899 12.8772 2.70508 11.2239 2.70508 9.5C2.70508 7.77609 3.3899 6.12279 4.60888 4.90381C5.82787 3.68482 7.48117 3 9.20508 3ZM9.20508 5C6.70508 5 4.70508 7 4.70508 9.5C4.70508 12 6.70508 14 9.20508 14C11.7051 14 13.7051 12 13.7051 9.5C13.7051 7 11.7051 5 9.20508 5Z"
                    fill="black"
                  />
                </svg>
              </span>
            </button>

            {/* Location dropdown */}
            {showLocationDropdown && (
              <div className={styles.locationDropdown}>
                {filteredLocations.map((location) => (
                  <div
                    key={location.id}
                    className={styles.locationOption}
                    onClick={() => handleLocationSelect(location)}
                  >
                    {location.name}
                  </div>
                ))}
                <div
                  className={styles.locationOption}
                  onClick={() => {
                    setValue('endLocation', 'Other');
                    setSearchQuery('Other (Custom Address)');
                    setShowLocationDropdown(false);
                    setShowLocationButton(false);
                  }}
                >
                  Other (Custom Address)
                </div>
              </div>
            )}
          </div>
          {errors.endLocation && (
            <p className={styles.error}>
              {errors.endLocation.message as string}
            </p>
          )}

          {/* Map */}
          <div className={styles.pickupMapContainer}>
            <RequestRideMap
              pickupLocation={null}
              dropoffLocation={dropoffLocation}
              availableLocations={locations}
              enableDropoffMapClick
              onPickupSelect={() => {}}
              onDropoffSelect={handleDropoffSelect}
            />
          </div>

          {/* Dropoff time text */}
          <div className={styles.pickupTimeText}>Drop me off by ...</div>

          <CustomTimePicker
            value={watchDropoffTime || ''}
            onChange={(t) => setValue('dropoffTime', t)}
            label="Time"
          />
          {errors.dropoffTime && (
            <p className={styles.error}>
              {errors.dropoffTime.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Hidden form fields for validation */}
      <div
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: 0,
          height: 0,
          overflow: 'hidden',
        }}
      >
        <input
          type="text"
          {...register('endLocation', {
            required:
              !watchCustomCheckbox && 'Please select a dropoff location',
            validate: (dropOffLocation: string) => {
              if (watchCustomCheckbox) return true;
              const pickUpLocation = getValues('startLocation');
              return (
                dropOffLocation !== pickUpLocation ||
                'Pickup and dropoff locations cannot be the same'
              );
            },
          })}
        />
        <Input
          id="dropoffTime"
          type="time"
          {...register('dropoffTime', {
            required: 'Please select a dropoff time',
            validate: (dropoffTime: string) => {
              const startDate = getValues('startDate');
              const pickupTime = getValues('pickupTime');
              const dropoff = moment(`${startDate} ${dropoffTime}`);
              if (startDate && pickupTime) {
                const pickup = moment(`${startDate} ${pickupTime}`);
                if (dropoff.isBefore(pickup)) {
                  return 'Dropoff time must be after pickup time';
                }
              }
              if (startDate) {
                if (!isTimeValid(startDate, dropoffTime)) {
                  return 'Please enter a valid date. (Note: CULifts does not operate during weekends or university-wide breaks.)';
                }
              }
              return (
                checkBounds(startDate, dropoff) ||
                'Please select a valid dropoff time between 7:45 AM and 10:00 PM.'
              );
            },
          })}
        />
      </div>

      {/* Bottom section with page indicators and buttons */}
      <div className={styles.bottomSection}>
        {/* Page indicators */}
        <div className={styles.pageIndicators}>
          <div
            className={`${styles.pageIndicator} ${
              currentStep === 'date' ? styles.pageIndicatorActive : ''
            }`}
          />
          <div
            className={`${styles.pageIndicator} ${
              currentStep === 'pickup' ? styles.pageIndicatorActive : ''
            }`}
          />
          <div
            className={`${styles.pageIndicator} ${
              currentStep === 'dropoff' ? styles.pageIndicatorActive : ''
            }`}
          />
        </div>

        {/* Bottom button frame */}
        <div className={styles.bottomButtonFrame}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleBack}
          >
            Back
          </button>
          <button
            type="button"
            className={styles.saveContinueButton}
            disabled={!isFormValid}
            onClick={handleSaveAndContinue}
          >
            Save and Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default DropoffLocationStep;
