import React from 'react';
import { useFormContext } from 'react-hook-form';
import moment from 'moment';
import { Ride } from '../../../types';
import { RideModalType } from '../types';
import { useLocations } from '../../../context/LocationsContext';
import styles from '../requestridemodal.module.css';

type SummaryStepProps = {
  ride?: Ride;
  modalType: RideModalType;
};

const SummaryStep: React.FC<SummaryStepProps> = ({ ride, modalType }) => {
  const { watch } = useFormContext();
  const { locations } = useLocations();

  const formData = watch();
  const {
    startDate,
    startLocation,
    endLocation,
    pickupTime,
    dropoffTime,
    recurring,
    whenRepeat,
    endDate,
    customPickup,
    pickupCity,
    pickupZip,
    customDropoff,
    dropoffCity,
    dropoffZip,
  } = formData;

  const getLocationName = (locationId: string) => {
    if (locationId === 'Other') {
      return 'Custom Address';
    }
    const location = locations.find((loc) => loc.id === locationId);
    return location ? location.name : locationId;
  };

  const getPickupAddress = () => {
    if (startLocation === 'Other') {
      return `${customPickup || ''}, ${pickupCity || 'Ithaca'} NY, ${
        pickupZip || '14853'
      }`;
    }
    return getLocationName(startLocation);
  };

  const getDropoffAddress = () => {
    if (endLocation === 'Other') {
      return `${customDropoff || ''}, ${dropoffCity || 'Ithaca'} NY, ${
        dropoffZip || '14850'
      }`;
    }
    return getLocationName(endLocation);
  };

  const formatTime = (time: string) => {
    if (!time) return 'Not set';
    return moment(time, 'HH:mm').format('h:mm A');
  };

  return (
    <div className={styles.stepPage}>
      <h2 className={styles.stepTitle}>Review Your Request</h2>
      <p className={styles.stepDescription}>
        Please review your ride details before submitting
      </p>

      <div className={styles.summaryContainer}>
        <div className={styles.summarySection}>
          <h3 className={styles.summarySectionTitle}>Date & Time</h3>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Date:</span>
            <span className={styles.summaryValue}>
              {startDate
                ? moment(startDate).format('MMMM D, YYYY')
                : 'Not set'}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Pickup Time:</span>
            <span className={styles.summaryValue}>{formatTime(pickupTime)}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Dropoff Time:</span>
            <span className={styles.summaryValue}>
              {formatTime(dropoffTime)}
            </span>
          </div>
        </div>

        <div className={styles.summarySection}>
          <h3 className={styles.summarySectionTitle}>Locations</h3>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Pickup:</span>
            <span className={styles.summaryValue}>{getPickupAddress()}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Dropoff:</span>
            <span className={styles.summaryValue}>{getDropoffAddress()}</span>
          </div>
        </div>

        {recurring && (
          <div className={styles.summarySection}>
            <h3 className={styles.summarySectionTitle}>Repeat Schedule</h3>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Frequency:</span>
              <span className={styles.summaryValue}>
                {whenRepeat
                  ? whenRepeat.charAt(0).toUpperCase() + whenRepeat.slice(1)
                  : 'Not set'}
              </span>
            </div>
            {endDate && (
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Ends:</span>
                <span className={styles.summaryValue}>
                  {moment(endDate).format('MMMM D, YYYY')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryStep;
