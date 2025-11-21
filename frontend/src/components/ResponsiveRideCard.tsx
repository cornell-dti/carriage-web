import React, { FC, ReactNode, useState } from 'react';
import { Ride, SchedulingState, Status } from '../types';
import {
  FlagRounded,
  Place,
  SubdirectoryArrowRight,
  WatchLater,
} from '@mui/icons-material';
import { AdvancedMarker, Map, Pin } from '@vis.gl/react-google-maps';
import styles from './ResponsiveRideCard.module.css';

interface ResponsiveRideCardProps {
  ride: Ride;
  handleEdit: (rideToEdit: Ride) => any;
}

type FormattedTime = { time: string; meridiem: 'AM' | 'PM' };

const formatTime = (time: Date): FormattedTime => {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true, // ensures AM/PM
  };

  const formatter = new Intl.DateTimeFormat(undefined, options);
  const parts = formatter.formatToParts(time);

  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  const meridiem: 'AM' | 'PM' = (parts
    .find((p) => p.type === 'dayPeriod')
    ?.value.toUpperCase() ?? 'AM') as 'AM' | 'PM';

  return {
    time: `${hour}:${minute}`,
    meridiem,
  };
};

const renderFormattedTime = (time: Date): ReactNode => {
  const formattedTime = formatTime(time);
  return (
    <span className={styles.timeWrapper}>
      <p>{formattedTime.time}</p>
      <p className={styles.timeMeridiem}>{formattedTime.meridiem}</p>
    </span>
  );
};

const ResponsiveRideCard: FC<ResponsiveRideCardProps> = ({
  ride,
  handleEdit,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div className={styles.card}>
      {/* ride status, check if scheduled. If not, display card indicating */}
      {ride.schedulingState === SchedulingState.UNSCHEDULED ? (
        <div className={`${styles.statusBadge} ${styles.statusRequested}`}>
          <p>Requested</p>
        </div>
      ) : ride.status === Status.CANCELLED ? (
        <div className={`${styles.statusBadge} ${styles.statusCanceled}`}>
          <p>Canceled</p>
        </div>
      ) : (
        <></>
      )}
      <div
        className={`${styles.contentWrapper} ${
          expanded
            ? styles.contentWrapperExpanded
            : styles.contentWrapperCollapsed
        }`}
      >
        <div className={styles.infoSection}>
          {/* time-related */}
          <div className={styles.column}>
            <span className={styles.row}>
              <span className={styles.labelWrapper}>
                <WatchLater />
                <p className={styles.labelText}>Start</p>
              </span>
              {renderFormattedTime(new Date(ride.startTime))}
            </span>
            <span className={styles.rowSecondary}>
              <span className={styles.labelWrapper}>
                <SubdirectoryArrowRight />
                <p className={styles.labelText}>End</p>
              </span>
              {renderFormattedTime(new Date(ride.endTime))}
            </span>
          </div>

          {/* location-related */}
          <div className={styles.column}>
            <span className={styles.row}>
              <span className={styles.labelWrapper}>
                <Place />
                <p className={styles.labelText}>Pickup</p>
              </span>
              <p>{ride.startLocation.shortName}</p>
            </span>
            <span className={styles.rowSecondary}>
              <span className={styles.labelWrapper}>
                <FlagRounded />
                <p className={styles.labelText}>Dropoff</p>
              </span>
              <p>{ride.endLocation.shortName}</p>
            </span>
          </div>
        </div>
        {/* expanded location view */}
        {expanded && (
          <div className={styles.mapContainer}>
            <Map
              className={styles.map}
              defaultCenter={{
                lat: (ride.startLocation.lat + ride.endLocation.lat) / 2,
                lng: (ride.startLocation.lng + ride.endLocation.lng) / 2,
              }}
              defaultZoom={13}
              gestureHandling="greedy"
              disableDefaultUI
              mapId={process.env.REACT_APP_GOOGLE_MAPS_MAP_ID}
            >
              <AdvancedMarker
                position={{
                  lat: ride.startLocation.lat,
                  lng: ride.startLocation.lng,
                }}
                clickable={true}
                title={ride.startLocation.shortName}
              >
                <Pin background={'#222'} glyphColor="#fff" borderColor="#222" />
              </AdvancedMarker>
              <AdvancedMarker
                position={{
                  lat: ride.endLocation.lat,
                  lng: ride.endLocation.lng,
                }}
                clickable={true}
                title={ride.endLocation.shortName}
              >
                <FlagRounded className={styles.flagIcon} />
              </AdvancedMarker>
            </Map>
          </div>
        )}
      </div>
      {/* expanded buttons */}
      {expanded ? (
        <div className={styles.buttonContainer}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(false);
            }}
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            Hide Details
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(ride);
            }}
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            Edit
          </button>
        </div>
      ) : (
        <></>
      )}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`${styles.button} ${styles.buttonSecondary} ${
          styles.detailsButton
        } ${expanded ? styles.expandedDetailsButton : styles.detailsButton}`}
      >
        {expanded ? 'Hide Details' : 'Details'}
      </button>
    </div>
  );
};

export default ResponsiveRideCard;
