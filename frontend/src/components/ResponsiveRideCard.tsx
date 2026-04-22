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
    <span className="flex gap-1 items-center">
      <p>{formattedTime.time}</p>
      <p className="text-xs text-gray-500 font-light">
        {formattedTime.meridiem}
      </p>
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
    <div className="w-full relative h-min min-w-80 bg-white rounded px-4 py-4 flex flex-col gap-4 border border-[#e0e0e0] text-base">
      <div className="w-full h-min flex items-center justify-between">
        {/* ride status chip */}
        {ride.schedulingState === SchedulingState.UNSCHEDULED ? (
          <div className="w-32 h-7 rounded flex justify-center items-center text-base text-gray-500 bg-[#f5f5f5]">
            <p>Requested</p>
          </div>
        ) : ride.status === Status.CANCELLED ? (
          <div className="w-32 h-7 rounded flex justify-center items-center text-base text-red-700 bg-[#fff0f0]">
            <p>Canceled</p>
          </div>
        ) : ride.status === Status.NO_SHOW ? (
          <div className="w-32 h-7 rounded flex justify-center items-center text-base text-red-700 bg-[#fff0f0]">
            <p>No Show</p>
          </div>
        ) : (
          <div className="w-32 h-7 rounded flex justify-center items-center text-base text-gray-500 bg-[#f5f5f5]">
            <p>Approved</p>
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className={`${buttonStyles.button} ${buttonStyles.buttonSecondary} max-w-32`}
        >
          {expanded ? 'Hide Details' : 'Details'}
        </button>
      </div>
      <div
        className={`w-full h-min flex text-nowrap ${
          expanded
            ? 'flex-col justify-normal gap-4'
            : 'flex-row justify-between gap-4'
        }`}
      >
        <div className="w-full h-min flex max-sm:flex-col max-sm:gap-4">
          {/* time-related */}
          <div className="w-full h-min flex flex-col gap-2">
            <span className="flex gap-2 items-center">
              <span className="flex items-center gap-1 w-20">
                <WatchLater />
                <p className="text-xs">Start</p>
              </span>
              {renderFormattedTime(new Date(ride.startTime))}
            </span>
            <span className="flex gap-2 items-center text-gray-500">
              <span className="flex items-center gap-1 w-20">
                <SubdirectoryArrowRight />
                <p className="text-xs">End</p>
              </span>
              {renderFormattedTime(new Date(ride.endTime))}
            </span>
          </div>

          {/* location-related */}
          <div className="w-full h-min flex flex-col gap-2">
            <span className="flex gap-2 items-center">
              <span className="flex items-center gap-1 w-20">
                <Place />
                <p className="text-xs">Pickup</p>
              </span>
              <p>{ride.startLocation.name}</p>
            </span>
            <span className="flex gap-2 items-center text-gray-500">
              <span className="flex items-center gap-1 w-20">
                <FlagRounded />
                <p className="text-xs">Dropoff</p>
              </span>
              <p>{ride.endLocation.name}</p>
            </span>
          </div>
        </div>
        {/* driver info */}
        {expanded && (
          <div>
            <span className="flex gap-2 items-center">
              <span className="flex items-center gap-1 w-20">
                <BadgeRounded></BadgeRounded>
                <p className="text-xs">Driver</p>
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
          <div className="w-full h-min flex gap-2 rounded overflow-hidden border border-[#e0e0e0]">
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
                className="w-full h-48 rounded"
                defaultCenter={{
                  lat: (ride.startLocation.lat + ride.endLocation.lat) / 2,
                  lng: (ride.startLocation.lng + ride.endLocation.lng) / 2,
                }}
                defaultZoom={13}
                gestureHandling="greedy"
                disableDefaultUI
                mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
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
                  <FlagRounded className="text-gray-600 w-12 h-12" />
                </AdvancedMarker>
              </Map>
            )}
          </div>
        )}
      </div>

      {/* expanded buttons */}
      {expanded ? (
        <div className="w-full h-min flex gap-2">
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
