import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { Ride } from '../../types';
import { useDate } from '../../context/date';
import Modal from '../RideStatus/SModal';
import { useRides } from '../../context/RidesContext';
import axios from '../../util/axios';
import styles from './schedule.module.css';
import ResponsiveRideCard from '../ResponsiveRideCard';

const Schedule = () => {
  const { scheduledRides, refreshRides } = useRides();

  const scheduleDay = useDate().curDate;
  const minTime = new Date(scheduleDay);
  minTime.setHours(7, 0, 0, 0);
  const maxTime = new Date(scheduleDay);
  maxTime.setHours(23, 0, 0, 0);

  const [currentRide, setCurrentRide] = useState<Ride | undefined>(undefined);

  const [isOpen, setIsOpen] = useState(false);
  const closeModal = () => setIsOpen(false);

  const cancelRide = (ride: Ride) => {
    const rideId = ride.id;
    const recurring = ride.isRecurring;
    if (recurring) {
      axios
        .put(`api/rides/${rideId}/edits`, {
          deleteOnly: 'true',
          origDate: scheduleDay,
        })
        .then(refreshRides)
        .then(closeModal);
    } else {
      axios.delete(`/api/rides/${rideId}`).then(refreshRides).then(closeModal);
    }
  };

  const handleRideSelected = (selection: Ride | undefined) => {
    if (selection === undefined) {
      setIsOpen(false);
      setCurrentRide(undefined);
    } else {
      setIsOpen(true);
      setCurrentRide(selection);
    }
  };

  return (
    <>
      {currentRide && (
        <Modal
          isOpen={isOpen}
          close={closeModal}
          ride={currentRide}
          cancel={cancelRide}
        />
      )}
      <div>
        <div>
          <ScheduledTimeline
            baseDate={scheduleDay}
            rides={scheduledRides.filter((ride) => {
              if (ride === undefined) {
                console.error(ride, 'ride undefined!');
                return false;
              }

              return true;
            })}
            handleSelection={handleRideSelected}
          ></ScheduledTimeline>
        </div>
      </div>
    </>
  );
};

interface ScheduledTimelineProps {
  baseDate: Date;
  rides: Ride[];
  selected?: Ride;
  handleSelection: (selectionChange: Ride | undefined) => void;
  halfHourWidth?: number;
}

const ScheduledTimeline: FC<ScheduledTimelineProps> = ({
  baseDate,
  rides,
  selected,
  handleSelection,
  halfHourWidth = 100,
}) => {
  const [nameDisplayMode, setNameDisplayMode] = useState<'student' | 'driver'>(
    'student'
  );

  const timeLabels = useMemo(() => {
    const labels = [];
    const startTime = new Date();
    startTime.setHours(7, 0, 0); // 7:00 AM

    const endTime = new Date();
    endTime.setHours(20, 30, 0); // 3:30 PM

    let currentTime = new Date(startTime);

    while (currentTime <= endTime) {
      labels.push(moment(currentTime).format('h:mm A'));

      currentTime = new Date(currentTime.getTime() + 30 * 60000);
    }

    return labels;
  }, []);

  const minuteWidth = useMemo(() => halfHourWidth / 30, [halfHourWidth]);

  const baseTime: Date = useMemo<Date>(() => {
    const baseTimeForToday = new Date(baseDate);
    baseTimeForToday.setHours(7);
    baseTimeForToday.setMinutes(0);
    baseTimeForToday.setSeconds(0);
    baseTimeForToday.setMilliseconds(0);
    return baseTimeForToday;
  }, [baseDate]);

  const calculateRidePosition = useCallback(
    (startTime: Date, endTime: Date) => {
      // Calculate minutes from 7:00 AM
      const startMinutesFromBase =
        (startTime.getTime() - baseTime.getTime()) / (60 * 1000);
      const endMinutesFromBase =
        (endTime.getTime() - baseTime.getTime()) / (60 * 1000);

      // Calculate position and width
      const positionFromLeft = startMinutesFromBase * minuteWidth;
      const width = (endMinutesFromBase - startMinutesFromBase) * minuteWidth;

      return { positionFromLeft, width };
    },
    [minuteWidth, baseTime]
  );

  return (
    <div
      style={{
        width: '100%',
        height: '30rem',
        display: 'flex',
        position: 'relative',
        flex: 1,
        flexDirection: 'column',
        gap: '.5rem',
      }}
    >
      {/* current time and name display mode */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        <button
          className={styles.topControlButton}
          onClick={() => {
            const element = document.getElementById(
              'timeline-current-indicator'
            );
            const parentDiv =
              element?.closest('.overflow-x-scroll') || element?.parentElement;

            if (element && parentDiv) {
              // Get the parent's dimensions and scroll position
              const parentRect = parentDiv.getBoundingClientRect();
              const elementRect = element.getBoundingClientRect();

              // Calculate the scroll position to center the element
              const scrollLeft =
                element.offsetLeft -
                parentRect.width / 2 +
                elementRect.width / 2;

              // Scroll smoothly to the calculated position
              parentDiv.scrollTo({
                left: scrollLeft,
                behavior: 'smooth',
              });
            }
          }}
        >
          {`Now: ${moment(Date.now()).format('h:mm A')}`}
        </button>
        <button
          className={styles.topControlButton}
          onClick={() => {
            setNameDisplayMode(
              nameDisplayMode === 'driver' ? 'student' : 'driver'
            );
          }}
        >
          {nameDisplayMode === 'driver'
            ? 'Showing Driver Names'
            : 'Showing Student Names'}
        </button>
      </div>
      {/* timeline container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'solid 1px #dddddd',
          borderRadius: '0.5rem',
          backgroundColor: '#fff',
          padding: '1rem 1rem 0.5rem 1rem',
        }}
      >
        {/* timeline horizontal scroll */}
        <div
          style={{
            width: '100%',
            height: '100%',
            overflowX: 'scroll',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/* tick labels */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              pointerEvents: 'none',
              marginLeft: 0,
            }}
          >
            {timeLabels.map((timeLabel, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  paddingLeft: '0.125rem',
                  width: halfHourWidth,
                  maxWidth: halfHourWidth,
                  minWidth: halfHourWidth,
                }}
              >
                <p
                  style={{
                    color: 'rgb(163, 163, 163)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {timeLabel}
                </p>
              </div>
            ))}
          </div>
          {/* timeline lines for rides */}
          <div
            style={{
              maxHeight: '18rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              position: 'relative',
              width: `${halfHourWidth * timeLabels.length}px`,
            }}
          >
            {rides.map((ride, idx) => {
              const { positionFromLeft, width } = calculateRidePosition(
                new Date(ride.startTime),
                new Date(ride.endTime)
              );

              return (
                <div
                  key={idx}
                  style={{
                    height: '2.5rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  id={`${ride.id}-timeline`}
                >
                  {/* Student/Driver name */}
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'end',
                      alignItems: 'center',
                      paddingRight: '0.5rem',
                      minWidth: `${positionFromLeft}px`,
                      maxWidth: `${positionFromLeft}px`,
                    }}
                  >
                    <p
                      style={{
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {nameDisplayMode === 'driver'
                        ? ride.driver
                          ? ride.driver.firstName
                          : 'No Driver Assigned'
                        : ride.riders[0]
                        ? ride.riders[0].firstName +
                          ' ' +
                          ride.riders[0].lastName
                        : 'No Student'}
                    </p>
                  </div>

                  {/* Ride block with start time */}
                  <button
                    style={{
                      height: '100%',
                      border: '1px solid',
                      cursor: 'pointer',
                      borderRadius: '0.375rem',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 0.5rem',
                      overflow: 'hidden',
                      backgroundColor:
                        rides[0] === undefined || rides[0].status === 'no_show'
                          ? 'rgb(229, 229, 229)'
                          : 'rgb(23, 23, 23)',
                      borderColor:
                        rides[0] === undefined || rides[0].status === 'no_show'
                          ? 'rgb(209, 213, 219)'
                          : 'rgb(38, 38, 38)',
                      color:
                        rides[0] === undefined || rides[0].status === 'no_show'
                          ? 'rgb(64, 64, 64)'
                          : 'rgb(245, 245, 245)',
                      left: `${positionFromLeft}px`,
                      width: `${Math.max(width, 50)}px`,
                    }}
                    onClick={() =>
                      selected === ride
                        ? handleSelection(undefined)
                        : handleSelection(ride)
                    }
                  >
                    <div className="flex flex-col justify-center">
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color:
                            rides[0] === undefined ||
                            rides[0].status === 'no_show'
                              ? 'rgb(38, 38, 38)'
                              : 'rgb(245, 245, 245)',
                        }}
                      >
                        {/* date cast*/}
                        {new Date(ride.startTime).getHours() % 12 || 12}:
                        {/* date cast */}
                        {new Date(ride.startTime)
                          .getMinutes()
                          .toString()
                          .padStart(2, '0')}
                        {/* date cast */}
                        {new Date(ride.startTime).getHours() >= 12
                          ? 'PM'
                          : 'AM'}
                      </p>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
          {/* tick marks */}
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              display: 'flex',
              top: 0,
              pointerEvents: 'none',
            }}
          >
            {timeLabels.map((_timeLabel, idx) => (
              <div
                key={idx}
                style={{
                  height: '100%',
                  borderLeft: '1px solid rgb(209, 213, 219)',
                  width: halfHourWidth,
                  maxWidth: halfHourWidth,
                  minWidth: halfHourWidth,
                }}
              ></div>
            ))}
          </div>
          {/* current line */}
          <div
            id="timeline-current-indicator"
            style={{
              width: '0.25rem',
              height: '100%',
              position: 'absolute',
              top: 0,
              pointerEvents: 'none',
              borderLeft: '4px dotted rgba(37, 99, 235, 0.5)',
              left: (() => {
                const sameTimeButOnTargetDay = new Date(baseDate);
                const now = new Date();
                sameTimeButOnTargetDay.setHours(now.getHours());
                sameTimeButOnTargetDay.setMinutes(now.getMinutes());
                sameTimeButOnTargetDay.setSeconds(now.getSeconds());
                sameTimeButOnTargetDay.setMilliseconds(now.getMilliseconds());
                return (
                  ((sameTimeButOnTargetDay.getTime() - baseTime.getTime()) /
                    (60 * 1000)) *
                  minuteWidth
                );
              })(),
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
