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
import styles from '../requestridemodal.module.css';

type PickupLocationStepProps = {
  ride?: Ride;
  modalType: RideModalType;
  currentStep?: 'date' | 'pickup' | 'dropoff';
  onClose?: () => void;
  onNext?: () => void;
  onBack?: () => void;
};

const PickupLocationStep: React.FC<PickupLocationStepProps> = ({
  ride,
  modalType,
  currentStep = 'pickup',
  onClose,
  onNext,
  onBack,
}) => {
  const {
    register,
    getValues,
    watch,
    setValue,
  } = useFormContext();

  const [locations, setLocations] = useState<Location[]>([]);
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showLocationButton, setShowLocationButton] = useState(false);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [timeHour, setTimeHour] = useState<string>('');
  const [timeMinute, setTimeMinute] = useState<string>('');
  const [timePeriod, setTimePeriod] = useState<'AM' | 'PM'>('AM');
  const searchInputRef = useRef<HTMLDivElement>(null);
  const locationButtonRef = useRef<HTMLButtonElement>(null);
  const watchPickupCustom = watch('startLocation');
  const watchCustomCheckbox = watch('customPickupLocation', false);
  const watchStartLocation = watch('startLocation');
  const watchPickupTime = watch('pickupTime');
  const loc = useLocations().locations;

  // Initialize time fields from watchPickupTime
  useEffect(() => {
    if (watchPickupTime && watchPickupTime !== '') {
      const time = moment(watchPickupTime, 'HH:mm');
      setTimeHour(time.format('h'));
      setTimeMinute(time.format('mm'));
      setTimePeriod(time.format('A') as 'AM' | 'PM');
    }
  }, [watchPickupTime]);

  // Update form value only when minute is complete and valid (2 digits, 00–59)
  const timeMinuteNum = timeMinute.length === 2 ? parseInt(timeMinute, 10) : null;
  const timeMinuteInvalid = timeMinuteNum !== null && (Number.isNaN(timeMinuteNum) || timeMinuteNum > 59);
  useEffect(() => {
    if (timeHour && timeMinute.length === 2 && !timeMinuteInvalid) {
      const hour24 = timePeriod === 'AM'
        ? (timeHour === '12' ? 0 : parseInt(timeHour, 10))
        : (timeHour === '12' ? 12 : parseInt(timeHour, 10) + 12);
      const timeString = `${hour24.toString().padStart(2, '0')}:${timeMinute.padStart(2, '0')}`;
      setValue('pickupTime', timeString);
    }
  }, [timeHour, timeMinute, timePeriod, setValue, timeMinuteInvalid]);

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
    // Use all locations from context for the selector,
    // and let the map handle filtering by coordinates internally
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
      const defaultStart =
        ride.startLocation.tag === 'custom'
          ? 'Other'
          : ride.startLocation.id ?? '';
      setValue('startLocation', defaultStart);
    }
  }, [locations, ride, setValue]);

  useEffect(() => {
    if (ride && watchPickupCustom === 'Other') {
      const pickup = addresser.parseAddress(ride.startLocation.address);
      setValue('customPickup', pickup.addressLine1);
      setValue('pickupCity', pickup.placeName);
      setValue('pickupZip', pickup.zipCode);
    }
  }, [watchPickupCustom, ride, setValue]);

  useEffect(() => {
    if (watchCustomCheckbox) {
      setValue('startLocation', 'Other');
      setSearchQuery('Other (Custom Address)');
    }
  }, [watchCustomCheckbox, setValue]);

  const handlePickupSelect = (location: Location | null) => {
    setPickupLocation(location);
    if (location) {
      const foundLocation = locations.find((loc) => loc.id === location.id);
      if (foundLocation) {
        setValue('startLocation', foundLocation.id);
        setSearchQuery(foundLocation.name);
        setShowLocationDropdown(false);
        setShowLocationButton(false);
      } else {
        setValue('startLocation', 'Other');
        const parsed = addresser.parseAddress(location.address);
        setValue('customPickup', parsed.addressLine1);
        setValue('pickupCity', parsed.placeName);
        setValue('pickupZip', parsed.zipCode);
      }
    }
  };

  const handleLocationSelect = (location: Location) => {
    setValue('startLocation', location.id);
    setSearchQuery(location.name);
    setShowLocationDropdown(false);
    setShowLocationButton(false);
    setPickupLocation(location);
  };

  // Check if form is valid for enabling "Save and Continue" button
  const isFormValid = useMemo(() => {
    const hasLocation = watchStartLocation && watchStartLocation !== '' && watchStartLocation !== undefined;
    const hasTime = watchPickupTime && watchPickupTime !== '' && watchPickupTime !== undefined;

    // Basic validation - just check if both fields are filled
    // Let form validation handle more complex checks on submit
    return hasLocation && hasTime;
  }, [watchStartLocation, watchPickupTime]);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY !== null) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - dragStartY;
      if (diff > 100 && onClose) {
        onClose();
        setDragStartY(null);
      }
    }
  };

  const handleTouchEnd = () => {
    setDragStartY(null);
  };

  // Get selected location name for display
  const getSelectedLocationName = () => {
    if (watchStartLocation && watchStartLocation !== '') {
      if (watchStartLocation === 'Other') {
        return 'Other (Custom Address)';
      }
      const location = locations.find((loc) => loc.id === watchStartLocation);
      return location ? location.name : 'Select pickup location';
    }
    return 'Select pickup location';
  };

  return (
    <div className={styles.stepPage}>
      <div className={styles.topContent}>
        {/* Drag handle at the top */}
        <div
          className={styles.dragHandle}
          onClick={onClose}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {/* Top frame with pickup location selection */}
        <div className={styles.pickupLocationFrame}>
          <div className={styles.pickupLocationTitle}>Select pickup location:</div>

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
                  !watchStartLocation || watchStartLocation === ''
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
                    setValue('startLocation', 'Other');
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

          {/* Map */}
          <div className={styles.pickupMapContainer}>
            <RequestRideMap
              pickupLocation={pickupLocation}
              dropoffLocation={null}
              availableLocations={locations}
              enablePickupMapClick
              onPickupSelect={handlePickupSelect}
              onDropoffSelect={() => { }}
            />
          </div>

          {/* Pickup time text */}
          <div className={styles.pickupTimeText}>
            Pick me up by ...
          </div>

          {/* Time input - Figma-style */}
          <div className={styles.timeInputWrapper}>
            <div className={`${styles.timeInputContainer} ${timeMinuteInvalid ? styles.timeInputContainerError : ''}`}>
            <input
              type="text"
              className={styles.timeInputHour}
              placeholder="12"
              value={timeHour}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value === '' || (parseInt(value, 10) >= 1 && parseInt(value, 10) <= 12)) {
                  setTimeHour(value);
                }
              }}
              maxLength={2}
              aria-label="Hour"
            />
            <span className={styles.timeSeparator}>:</span>
            <input
              type="text"
              className={styles.timeInputMinute}
              placeholder="00"
              value={timeMinute}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                setTimeMinute(value);
              }}
              onBlur={() => {
                if (timeMinute === '') return;
                if (timeMinute.length === 1) {
                  setTimeMinute(timeMinute.padStart(2, '0'));
                }
                /* When minutes > 59 we leave the value so the user can correct it; error is shown below */
              }}
              maxLength={2}
              aria-label="Minute"
            />
            <div className={styles.timePeriodContainer}>
              <button
                type="button"
                className={`${styles.timePeriodButton} ${timePeriod === 'AM' ? styles.timePeriodButtonActive : ''}`}
                onClick={() => setTimePeriod('AM')}
              >
                AM
              </button>
              <button
                type="button"
                className={`${styles.timePeriodButton} ${timePeriod === 'PM' ? styles.timePeriodButtonActive : ''}`}
                onClick={() => setTimePeriod('PM')}
              >
                PM
              </button>
            </div>
            <span className={styles.timeIcon} aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            </div>
            {timeMinuteInvalid && (
              <p className={styles.timeInputError} role="alert">
                Please enter minutes between 00 and 59. You can correct it above.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hidden form fields for validation */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0, overflow: 'hidden' }}>
        <input
          type="text"
          {...register('startLocation', {
            required: !watchCustomCheckbox && 'Please select a pickup location',
            validate: (pickUpLocation: string) => {
              if (watchCustomCheckbox) return true;
              const dropOffLocation = getValues('endLocation');
              return (
                dropOffLocation !== pickUpLocation ||
                'Pickup and dropoff locations cannot be the same'
              );
            },
          })}
        />
        <Input
          id="pickupTime"
          type="time"
          {...register('pickupTime', {
            required: 'Please select a pickup time',
            validate: (pickupTime: string) => {
              const startDate = getValues('startDate');
              const pickup = moment(`${startDate} ${pickupTime}`);
              if (startDate) {
                if (!isTimeValid(startDate, pickupTime)) {
                  return 'Please enter a valid date. (Note: CULifts does not operate during weekends or university-wide breaks.)';
                }
              }
              return (
                checkBounds(startDate, pickup) ||
                'Please select a valid pickup time between 7:45 AM and 10:00 PM.'
              );
            },
          })}
        />
      </div>

      {/* Bottom section with page indicators and buttons */}
      <div className={styles.bottomSection}>
        {/* Page indicators */}
        <div className={styles.pageIndicators}>
          <div className={`${styles.pageIndicator} ${currentStep === 'date' ? styles.pageIndicatorActive : ''}`} />
          <div className={`${styles.pageIndicator} ${currentStep === 'pickup' ? styles.pageIndicatorActive : ''}`} />
          <div className={`${styles.pageIndicator} ${currentStep === 'dropoff' ? styles.pageIndicatorActive : ''}`} />
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

export default PickupLocationStep;
