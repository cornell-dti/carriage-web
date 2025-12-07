import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import { Ride } from '../../types';
import { useDate } from '../../context/date';
import Modal from '../RideStatus/SModal';
import { useRides } from '../../context/RidesContext';
import axios from '../../util/axios';
import buttonStyles from '../../styles/button.module.css';
import { Replay, ZoomIn, ZoomOut } from '@mui/icons-material';

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

  const [localHalfHourWidth, setLocalHalfHourWidth] = useState(halfHourWidth);

  const timeLabels = useMemo(() => {
    const labels = [];
    const startTime = new Date();
    startTime.setHours(0, 0, 0);

    const endTime = new Date();
    endTime.setHours(24, 0, 0);

    let currentTime = new Date(startTime);

    while (currentTime <= endTime) {
      labels.push(moment(currentTime).format('h:mm A'));

      currentTime = new Date(currentTime.getTime() + 30 * 60000);
    }

    return labels;
  }, []);

  const minuteWidth = useMemo(
    () => localHalfHourWidth / 30,
    [localHalfHourWidth]
  );

  const baseTime: Date = useMemo<Date>(() => {
    const baseTimeForToday = new Date(baseDate);
    baseTimeForToday.setHours(0);
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

  const alternateTickThreshold = 100;

  const firstRideRef = useRef<HTMLParagraphElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (firstRideRef.current && containerRef.current) {
      containerRef.current.scrollTo({
        left: firstRideRef.current.offsetLeft,
        top: firstRideRef.current.offsetTop,
      });
    }
  }, [rides]);

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
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 'min-content',
            display: 'flex',
            gap: '0.25rem',
          }}
        >
          <button
            className={`${buttonStyles.button} ${buttonStyles.buttonSecondary}`}
            style={{ width: '16rem' }}
            onClick={() => {
              const element = document.getElementById(
                'timeline-current-indicator'
              );
              const parentDiv =
                element?.closest('.overflow-x-scroll') ||
                element?.parentElement;

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
            className={`${buttonStyles.button} ${buttonStyles.buttonSecondary}`}
            style={{ width: '16rem' }}
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '2rem',
              padding: '0 1rem',
              backgroundColor: '#eee',
              borderRadius: '0.25rem',
            }}
          >
            <p style={{ textWrap: 'nowrap' }}>
              {rides.length > 0
                ? rides.length > 1
                  ? `${rides.length} Rides Scheduled`
                  : `1 Ride Scheduled`
                : 'No Rides Scheduled'}
            </p>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            width: 'min-content',
          }}
        >
          {localHalfHourWidth !== halfHourWidth ? (
            <button
              className={`${buttonStyles.button} ${buttonStyles.buttonSecondary}`}
              aria-label="Restore Default"
              onClick={() => setLocalHalfHourWidth(halfHourWidth)}
            >
              <Replay></Replay>
            </button>
          ) : (
            <></>
          )}
          <button
            onClick={() => {
              setLocalHalfHourWidth((value) => {
                return Math.min(value + 10, 500);
              });
            }}
            className={`${buttonStyles.button} ${buttonStyles.buttonSecondary}`}
            aria-label="zoom-in"
          >
            <ZoomIn></ZoomIn>
          </button>
          <p>{((localHalfHourWidth / halfHourWidth) * 100).toFixed(0)}%</p>
          <button
            onClick={() => {
              setLocalHalfHourWidth((value) => {
                return Math.max(value - 10, 30);
              });
            }}
            className={`${buttonStyles.button} ${buttonStyles.buttonSecondary}`}
            aria-label="zoom-out"
          >
            <ZoomOut></ZoomOut>
          </button>
        </div>
      </div>
      {/* timeline container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'solid 1px #ddd',
          borderRadius: '0.5rem',
          backgroundColor: '#fff',
          padding: '2rem',
          boxShadow: '0px 5px 14px -7px rgba(0,0,0,0.13)',
        }}
      >
        {/* timeline horizontal scroll */}
        <div
          style={{
            width: '100%',
            height: '100%',
            overflowX: 'auto',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
          ref={containerRef}
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
            {timeLabels.map((timeLabel, idx) =>
              // skip a label once zoomed out enough
              localHalfHourWidth < alternateTickThreshold && idx % 2 === 1 ? (
                <span
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    paddingLeft: '0.125rem',
                    width: localHalfHourWidth,
                    maxWidth: localHalfHourWidth,
                    minWidth: localHalfHourWidth,
                  }}
                ></span>
              ) : (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    paddingLeft: '0.125rem',
                    width: localHalfHourWidth,
                    maxWidth: localHalfHourWidth,
                    minWidth: localHalfHourWidth,
                  }}
                >
                  <p
                    style={{
                      fontSize:
                        localHalfHourWidth < alternateTickThreshold
                          ? '.7rem'
                          : '1rem',
                      color: 'rgb(163, 163, 163)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {timeLabel}
                  </p>
                </div>
              )
            )}
          </div>
          {/* timeline lines for rides */}
          <div
            style={{
              maxHeight: '18rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              position: 'relative',
              width: `${localHalfHourWidth * timeLabels.length}px`,
            }}
          >
            {[...rides]
              .sort(
                (a, b) =>
                  new Date(a.startTime).getTime() -
                  new Date(b.startTime).getTime()
              )
              .map((ride, idx) => {
                const { positionFromLeft, width } = calculateRidePosition(
                  new Date(ride.startTime),
                  new Date(ride.endTime)
                );

                // rider block
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
                        ref={(ref) => {
                          if (idx === 0) firstRideRef.current = ref;
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
                        zIndex: '1',
                        backgroundColor:
                          rides[0] === undefined ||
                          rides[0].status === 'no_show'
                            ? 'rgb(229, 229, 229)'
                            : 'rgb(23, 23, 23)',
                        borderColor:
                          rides[0] === undefined ||
                          rides[0].status === 'no_show'
                            ? 'rgb(209, 213, 219)'
                            : 'rgb(38, 38, 38)',
                        color:
                          rides[0] === undefined ||
                          rides[0].status === 'no_show'
                            ? 'rgb(64, 64, 64)'
                            : 'rgb(245, 245, 245)',
                        left: `${positionFromLeft}px`,
                        width: `${Math.max(width, 5)}px`,
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
              minHeight: '100%',
              height: `${rides.length * 3}rem`,
              position: 'absolute',
              display: 'flex',
              top: 0,
              zIndex: '0',
              pointerEvents: 'none',
            }}
          >
            {timeLabels.map((_timeLabel, idx) => (
              <div
                key={idx}
                style={{
                  minHeight: '100%',
                  height: `${rides.length * 3}rem`, // scale based on how many rows need to be rendered
                  borderLeft:
                    idx % 2 === 1 && localHalfHourWidth < alternateTickThreshold
                      ? 'none'
                      : '1px solid rgb(209, 213, 219)',
                  width: localHalfHourWidth,
                  maxWidth: localHalfHourWidth,
                  minWidth: localHalfHourWidth,
                }}
              ></div>
            ))}
          </div>
          {/* current line */}
          <div
            id="timeline-current-indicator"
            style={{
              width: '0.25rem',
              minHeight: '100%',
              height: `${rides.length * 3}rem`, // scale based on how many rows need to be rendered
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
