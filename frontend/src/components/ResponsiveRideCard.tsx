import React, { FC, useState } from 'react';
import { Ride, SchedulingState, Status } from '../types';
import { Place, SubdirectoryArrowRight, WatchLater } from '@mui/icons-material';

interface ResponsiveRideCardProps {
  ride: Ride;
  handleEdit: (rideToEdit: Ride) => any;
}

const ResponsiveRideCard: FC<ResponsiveRideCardProps> = ({
  ride,
  handleEdit,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  console.log(ride);
  return (
    <button
      onClick={() => setExpanded(!expanded)}
      style={{
        width: '100%',
        height: 'min-content',
        maxWidth: '40rem',
        background: 'white',
        borderRadius: '0.25rem',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        border: '#dddddd 1px solid',
        cursor: 'pointer',
        fontSize: '1rem',
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
            <p>{ride.startTime}</p>
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
            <p>{ride.endTime}</p>
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
                width: 'flex-1',
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
                  height: '32rem',
                  background: '#8888ff',
                }}
              ></div>
            </div>
            {/* end location + map */}
            <div
              style={{
                width: 'flex-1',
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
                  height: '32rem',
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
            style={{
              width: '100%',
              height: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '#707070 1px solid',
              borderRadius: '0.25rem',
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
          >
            Edit
          </button>
        </div>
      )}
    </button>
  );
};

export default ResponsiveRideCard;
