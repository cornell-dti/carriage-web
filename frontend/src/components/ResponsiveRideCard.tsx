import React, { FC, ReactNode, useState } from 'react';
import { Ride, SchedulingState, Status } from '../types';
import { Place, SubdirectoryArrowRight, WatchLater } from '@mui/icons-material';

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
    <span
      style={{
        display: 'flex',
        gap: '0.25rem',
        alignItems: 'flex-end',
      }}
    >
      <p>{formattedTime.time}</p>
      <p
        style={{
          fontSize: '0.75rem',
          color: '707070',
          fontWeight: 'lighter',
        }}
      >
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

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      style={{
        width: '100%',
        maxWidth: '32rem',
        height: 'min-content',
        minWidth: '20rem',
        background: 'white',
        borderRadius: '0.25rem',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        border: '#e0e0e0 1px solid',
        cursor: 'pointer',
        fontSize: '1rem',
        gap: '1rem',
      }}
    >
      {/* ride status, check if scheduled. If not, display card indicating */}
      {ride.schedulingState === SchedulingState.UNSCHEDULED ? (
        <div
          style={{
            width: '100%',
            height: 'min-content',
            borderRadius: '0.1275rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#707070',
            backgroundColor: '#f5f5f5',
          }}
        >
          <p>Requested</p>
        </div>
      ) : ride.status === Status.CANCELLED ? (
        <div
          style={{
            width: '100%',
            height: 'min-content',
            borderRadius: '0.1275rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff0f0',
            color: '#c10000',
          }}
        >
          <p>Canceled</p>
        </div>
      ) : (
        <></>
      )}
      <div
        style={{
          width: '100%',
          height: 'min-content',
          display: 'flex',
          flexDirection: expanded ? 'column' : 'row',
          justifyContent: expanded ? 'normal' : 'space-between',
          gap: expanded ? 'auto' : '1.5rem',
          textWrap: 'nowrap',
        }}
      >
        {/* time-related */}
        <div
          style={{
            width: 'min-content',
            height: 'min-content',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <span
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            <WatchLater></WatchLater>
            {renderFormattedTime(new Date(ride.startTime))}
          </span>
          <span
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              color: '#707070',
            }}
          >
            <SubdirectoryArrowRight></SubdirectoryArrowRight>
            {renderFormattedTime(new Date(ride.endTime))}
          </span>
        </div>

        {/* location-related */}
        {!expanded && (
          <div
            style={{
              width: '8rem',
              height: 'min-content',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
              }}
            >
              <Place></Place>
              <p>{ride.startLocation.shortName}</p>
            </span>
            <span
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                color: '#707070',
              }}
            >
              <SubdirectoryArrowRight></SubdirectoryArrowRight>
              <p>{ride.endLocation.shortName}</p>
            </span>
          </div>
        )}
        {/* expanded location view */}
        {expanded && (
          <div
            style={{
              width: '100%',
              height: 'min-content',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            {/* start location + map */}
            <div
              style={{
                width: '100%',
                height: 'min-content',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}
              >
                <Place></Place>
                <p>{ride.startLocation.shortName}</p>
              </span>

              {/* map placeholder */}
              <div
                style={{
                  width: '100%',
                  height: '8rem',
                  background: '#8888ff',
                }}
              ></div>
            </div>
            {/* end location + map */}
            <div
              style={{
                width: '100%',
                height: 'min-content',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                  color: '#707070',
                }}
              >
                <SubdirectoryArrowRight></SubdirectoryArrowRight>
                <p>{ride.endLocation.shortName}</p>
              </span>

              {/* map placeholder */}
              <div
                style={{
                  width: '100%',
                  height: '8rem',
                  background: '#8888ff',
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
      {/* expanded buttons */}
      {expanded && (
        <div
          style={{
            width: '100%',
            height: 'min-content',
            display: 'flex',
            gap: '0.5rem',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(false);
            }}
            style={{
              width: '100%',
              height: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '#ddd 1px solid',
              borderRadius: '0.25rem',
              background: 'white',
              outline: 'none',
            }}
          >
            Close
          </button>
          <button
            style={{
              width: '100%',
              height: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '#303030 1px solid',
              borderRadius: '0.25rem',
              backgroundColor: '#000',
              color: '#fff',
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(ride);
            }}
          >
            Edit
          </button>
        </div>
      )}
    </button>
  );
};

export default ResponsiveRideCard;
