import React, { FC, ReactNode, useState } from 'react';
import { SchedulingState, Status, Tag } from '../types';
import { RideType } from '@carriage-web/shared/types/ride';
import {
  BadgeRounded,
  FlagRounded,
  Place,
  SubdirectoryArrowRight,
  WatchLater,
} from '@mui/icons-material';
import { AdvancedMarker, Map, Pin } from '@vis.gl/react-google-maps';

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
    <span timeWrapper}>
      <p>{formattedTime.time}</p>
      <p timeMeridiem}>{formattedTime.meridiem}</p>
    </span>
  );
};

const ResponsiveRideCard: FC<ResponsiveRideCardProps> = ({
  ride,
  handleEdit,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  // Check if either location is a custom location (with no valid coordinates)
  const hasCustomLocation = () => {
    const isPickupCustom =
      ride.startLocation.tag === Tag.CUSTOM ||
      ride.startLocation.lat === 0 ||
      ride.startLocation.lng === 0;
    const isDropoffCustom =
      ride.endLocation.tag === Tag.CUSTOM ||
      ride.endLocation.lat === 0 ||
      ride.endLocation.lng === 0;
    return isPickupCustom || isDropoffCustom;
  };

  return (
    <div card}>
      <div statusContainer}>
        {/* ride status chip */}
        {ride.schedulingState === SchedulingState.UNSCHEDULED ? (
          <div className={`statusBadge} ${statusRequested}`}>
            <p>Requested</p>
          </div>
        ) : ride.status === Status.CANCELLED ? (
          <div className={`statusBadge} ${statusCanceled}`}>
            <p>Canceled</p>
          </div>
        ) : ride.status === Status.NO_SHOW ? (
          <div className={`statusBadge} ${statusCanceled}`}>
            <p>No Show</p>
          </div>
        ) : (
          <div className={`statusBadge} ${statusScheduled}`}>
            <p>Approved</p>
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className={`${buttonStyles.button} ${buttonStyles.buttonSecondary} ${detailsButton}`}
        >
          {expanded ? 'Hide Details' : 'Details'}
        </button>
      </div>
      <div
        className={`contentWrapper} ${
          expanded
            ? contentWrapperExpanded
            : contentWrapperCollapsed
        }`}
      >
        <div infoSection}>
          {/* time-related */}
          <div column}>
            <span row}>
              <span labelWrapper}>
                <WatchLater />
                <p labelText}>Start</p>
              </span>
              {renderFormattedTime(new Date(ride.startTime))}
            </span>
            <span rowSecondary}>
              <span labelWrapper}>
                <SubdirectoryArrowRight />
                <p labelText}>End</p>
              </span>
              {renderFormattedTime(new Date(ride.endTime))}
            </span>
          </div>

          {/* location-related */}
          <div column}>
            <span row}>
              <span labelWrapper}>
                <Place />
                <p labelText}>Pickup</p>
              </span>
              <p>{ride.startLocation.name}</p>
            </span>
            <span rowSecondary}>
              <span labelWrapper}>
                <FlagRounded />
                <p labelText}>Dropoff</p>
              </span>
              <p>{ride.endLocation.name}</p>
            </span>
          </div>
        </div>
        {/* driver info */}
        {expanded && (
          <div>
            <span row}>
              <span labelWrapper}>
                <BadgeRounded></BadgeRounded>
                <p labelText}>Driver</p>
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
          <div mapContainer}>
            {hasCustomLocation() ? (
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
                    📍 Custom Location
                  </p>
                  <p style={{ fontSize: '14px', color: '#999' }}>
                    Map not available for custom locations
                  </p>
                </div>
              </div>
            ) : (
              <Map
                map}
                defaultCenter={{
                  lat: (ride.startLocation.lat + ride.endLocation.lat) / 2,
                  lng: (ride.startLocation.lng + ride.endLocation.lng) / 2,
                }}
                defaultZoom={13}
                gestureHandling="greedy"
                disableDefaultUI
                mapId={process.env.VITE_GOOGLE_MAPS_MAP_ID}
              >
                <AdvancedMarker
                  position={{
                    lat: ride.startLocation.lat,
                    lng: ride.startLocation.lng,
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
                    lat: ride.endLocation.lat,
                    lng: ride.endLocation.lng,
                  }}
                  clickable={true}
                  title={ride.endLocation.name}
                >
                  <FlagRounded flagIcon} />
                </AdvancedMarker>
              </Map>
            )}
          </div>
        )}
      </div>

      {/* expanded buttons */}
      {expanded ? (
        <div buttonContainer}>
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
