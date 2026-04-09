import React, { FC, ReactNode, useState } from 'react';
import { SchedulingState, Status, Tag } from '../types';
import { RideType } from '@carriage-web/shared/types/ride';
import { LocationType } from '@carriage-web/shared/types/location';
import {
  BadgeRounded,
  FlagRounded,
  Place,
  SubdirectoryArrowRight,
  WatchLater,
} from '@mui/icons-material';
import { AdvancedMarker, Map, Pin } from '@vis.gl/react-google-maps';
import styles from './ResponsiveRideCard.module.css';
import buttonStyles from '../styles/button.module.css';

interface ResponsiveRideCardProps {
  ride: RideType;
  handleEdit: (rideToEdit: RideType) => any;
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

/** Both endpoints must be finite numbers so Map defaultCenter and markers never receive NaN. */
const hasValidMapCoords = (loc: LocationType): boolean => {
  const lat = Number(loc.lat);
  const lng = Number(loc.lng);
  return Number.isFinite(lat) && Number.isFinite(lng);
};

const ResponsiveRideCard: FC<ResponsiveRideCardProps> = ({
  ride,
  handleEdit,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  // Custom tag / placeholder zeros, or missing non-finite coords — skip map to avoid Google Maps errors
  const hasCustomLocation = () => {
    const isPickupCustom =
      ride.startLocation.tag === Tag.CUSTOM ||
      Number(ride.startLocation.lat) === 0 ||
      Number(ride.startLocation.lng) === 0;
    const isDropoffCustom =
      ride.endLocation.tag === Tag.CUSTOM ||
      Number(ride.endLocation.lat) === 0 ||
      Number(ride.endLocation.lng) === 0;
    return isPickupCustom || isDropoffCustom;
  };

  const canShowRouteMap =
    hasValidMapCoords(ride.startLocation) &&
    hasValidMapCoords(ride.endLocation) &&
    !hasCustomLocation();

  const coordsInvalidForMap =
    !hasValidMapCoords(ride.startLocation) ||
    !hasValidMapCoords(ride.endLocation);

  const mapPlaceholderSubtitle = coordsInvalidForMap
    ? 'Map not available — location coordinates are missing or invalid.'
    : 'Map not available for custom locations';

  return (
    <div className={styles.card}>
      <div className={styles.statusContainer}>
        {/* ride status chip */}
        {ride.schedulingState === SchedulingState.UNSCHEDULED ? (
          <div className={`${styles.statusBadge} ${styles.statusRequested}`}>
            <p>Requested</p>
          </div>
        ) : ride.status === Status.CANCELLED ? (
          <div className={`${styles.statusBadge} ${styles.statusCanceled}`}>
            <p>Canceled</p>
          </div>
        ) : ride.status === Status.NO_SHOW ? (
          <div className={`${styles.statusBadge} ${styles.statusCanceled}`}>
            <p>No Show</p>
          </div>
        ) : (
          <div className={`${styles.statusBadge} ${styles.statusScheduled}`}>
            <p>Approved</p>
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className={`${buttonStyles.button} ${buttonStyles.buttonSecondary} ${styles.detailsButton}`}
        >
          {expanded ? 'Hide Details' : 'Details'}
        </button>
      </div>
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
              <p>{ride.startLocation.name}</p>
            </span>
            <span className={styles.rowSecondary}>
              <span className={styles.labelWrapper}>
                <FlagRounded />
                <p className={styles.labelText}>Dropoff</p>
              </span>
              <p>{ride.endLocation.name}</p>
            </span>
          </div>
        </div>
        {/* driver info */}
        {expanded && (
          <div>
            <span className={styles.row}>
              <span className={styles.labelWrapper}>
                <BadgeRounded></BadgeRounded>
                <p className={styles.labelText}>Driver</p>
              </span>
              <p>
                {ride.driver !== undefined
                  ? `${ride.driver.firstName} ${ride.driver.lastName}`
                  : 'Not Assigned'}
              </p>
            </span>
          </div>
        )}
        {/* expanded location view */}
        {expanded && (
          <div className={styles.mapContainer}>
            {!canShowRouteMap ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  minHeight: '200px',
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: '18px',
                      color: '#666',
                      marginBottom: '8px',
                    }}
                  >
                    📍 {coordsInvalidForMap ? 'Map unavailable' : 'Custom Location'}
                  </p>
                  <p style={{ fontSize: '14px', color: '#999' }}>
                    {mapPlaceholderSubtitle}
                  </p>
                </div>
              </div>
            ) : (
              <Map
                className={styles.map}
                defaultCenter={{
                  lat:
                    (Number(ride.startLocation.lat) +
                      Number(ride.endLocation.lat)) /
                    2,
                  lng:
                    (Number(ride.startLocation.lng) +
                      Number(ride.endLocation.lng)) /
                    2,
                }}
                defaultZoom={13}
                gestureHandling="greedy"
                disableDefaultUI
                mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
              >
                <AdvancedMarker
                  position={{
                    lat: Number(ride.startLocation.lat),
                    lng: Number(ride.startLocation.lng),
                  }}
                  clickable={true}
                  title={ride.startLocation.name}
                >
                  <Pin
                    background={'#222'}
                    glyphColor="#fff"
                    borderColor="#222"
                  />
                </AdvancedMarker>
                <AdvancedMarker
                  position={{
                    lat: Number(ride.endLocation.lat),
                    lng: Number(ride.endLocation.lng),
                  }}
                  clickable={true}
                  title={ride.endLocation.name}
                >
                  <FlagRounded className={styles.flagIcon} />
                </AdvancedMarker>
              </Map>
            )}
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
            className={`${buttonStyles.button} ${buttonStyles.buttonSecondary}`}
          >
            Hide Details
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(ride);
            }}
            className={`${buttonStyles.button} ${buttonStyles.buttonPrimary}`}
          >
            Edit
          </button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ResponsiveRideCard;
