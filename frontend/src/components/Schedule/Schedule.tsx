import React, {
  ComponentType,
  FC,
  JSXElementConstructor,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { EventWrapperProps, momentLocalizer } from 'react-big-calendar';
import cn from 'classnames';
import moment from 'moment';
import { Ride } from '../../types';
import { useDate } from '../../context/date';
import styles from './schedule.module.css';
import Modal from '../RideStatus/SModal';
import { useEmployees } from '../../context/EmployeesContext';
import { useRides } from '../../context/RidesContext';
import axios from '../../util/axios';
import { Button } from '@mui/material';

const colorMap = new Map<string, string[]>([
  ['red', ['FFA26B', 'FFC7A6']],
  ['blue', ['0084F4', '66B5F8']],
  ['yellow', ['FFCF5C', 'FFE29D']],
  ['green', ['00C48C', '7DDFC3']],
  ['black', ['1A051D', 'FBE4E8']],
]);
const colorIds = ['red', 'blue', 'yellow', 'green', 'black'];

type CalEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: string;
  ride: Ride;
};

type CalendarDriver = {
  resourceId: string;
  resourceTitle: string;
};

const Schedule = () => {
  const localizer = momentLocalizer(moment);
  const { scheduledRides, refreshRides } = useRides();

  const scheduleDay = useDate().curDate;
  const minTime = new Date(scheduleDay);
  minTime.setHours(7, 0, 0, 0);
  const maxTime = new Date(scheduleDay);
  maxTime.setHours(23, 0, 0, 0);

  const [events, setEvents] = useState<CalEvent[]>([]);
  const [calDrivers, setCalDrivers] = useState<CalendarDriver[]>([]);
  const { drivers } = useEmployees();
  const [viewMore, setViewMore] = useState(false);
  const [currentRide, setCurrentRide] = useState<Ride | undefined>(undefined);
  const [colorIdMap, setColorIdMap] = useState(new Map<string, string>());

  const [isOpen, setIsOpen] = useState(false);
  const closeModal = () => setIsOpen(false);

  const getRides = () => {
    setEvents(
      scheduledRides
        .filter((ride: Ride) => ride && ride.id)
        .map((ride: Ride) => ({
          id: ride.id,
          title: `${ride.startLocation.name} to ${ride.endLocation.name}
Rider: ${
            ride.riders && ride.riders.length > 0
              ? ride.riders.length === 1
                ? `${ride.riders[0].firstName} ${ride.riders[0].lastName}`
                : `${ride.riders[0].firstName} ${ride.riders[0].lastName} +${
                    ride.riders.length - 1
                  } more`
              : 'No rider assigned'
          }`,
          start: new Date(ride.startTime.toString()),
          end: new Date(ride.endTime.toString()),
          resourceId: ride.driver!.id,
          ride,
        }))
    );
  };

  useEffect(() => {
    getRides();
  }, [scheduledRides]);

  useEffect(() => {
    setCalDrivers(
      drivers.map((driver: any) => ({
        resourceId: driver.id,
        resourceTitle: driver.firstName.toUpperCase(),
      }))
    );
  }, [drivers]);

  useEffect(() => {
    const newColorIdMap = new Map<string, string>();
    calDrivers.map((resource, idx) => {
      const pos = idx % colorIds.length;
      newColorIdMap.set(resource.resourceId, colorIds[pos]);
      return true;
    });
    setColorIdMap(newColorIdMap);
  }, [calDrivers]);

  const eventStyle = (event: CalEvent) => {
    const colorName = colorIdMap.get(event.resourceId) || 'black';
    const color = colorMap.get(colorName) || ['1A051D', 'FBE4E8'];
    return {
      style: {
        borderLeft: `0.2rem solid #${color[0]}`,
        backgroundColor: `#${color[1]}`,
        borderRadius: 0,
        color: 'black',
      },
    };
  };

  const slotStyle = (d: Date) => ({
    style: {
      borderTop:
        d.getMinutes() !== 0 ? 'none' : '0.05rem solid rgba(0, 0, 0, 15%)',
    },
  });

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

  const onSelectEvent = (event: any) => {
    setIsOpen(true);
    setCurrentRide(event.ride);
  };

  const TabbableEventWrapper: ComponentType<
    PropsWithChildren<EventWrapperProps<CalEvent>>
  > = useMemo(
    () => (props) => {
      const child = React.Children.only(props.children) as ReactElement<
        any,
        string | JSXElementConstructor<any>
      >;
      return (
        <div>
          {React.cloneElement(child, {
            tabIndex: 0,
            onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>): void => {
              if (
                event.key === 'Enter' ||
                event.key === ' ' ||
                event.key === 'Spacebar'
              ) {
                // Prevents spacebar from scroll event
                event.preventDefault();
                onSelectEvent(props.event);
              }
            },
          })}
        </div>
      );
    },
    []
  );

  const handleChangeViewState = () => setViewMore(!viewMore);

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
      <div
        className={cn(styles.calendar_container, { [styles.long]: viewMore })}
      >
        <div className={cn(styles.left, { [styles.long]: viewMore })}>
          <ScheduledTimeline
            baseDate={scheduleDay}
            rides={scheduledRides}
            handleSelection={() => {}}
          ></ScheduledTimeline>
          {/* <Calendar
            formats={{ timeGutterFormat: 'h A' }}
            localizer={localizer}
            toolbar={false}
            step={5}
            defaultDate={scheduleDay}
            timeslots={12}
            showMultiDayTimes={true}
            events={events}
            defaultView="day"
            onSelectEvent={onSelectEvent}
            min={minTime}
            max={maxTime}
            resources={calDrivers}
            resourceIdAccessor="resourceId"
            resourceTitleAccessor="resourceTitle"
            eventPropGetter={eventStyle}
            slotPropGetter={slotStyle}
            components={{ eventWrapper: TabbableEventWrapper }}
          /> */}
        </div>
      </div>
      <button className={styles.view_state} onClick={handleChangeViewState}>
        view {viewMore ? 'less' : 'more'}
      </button>
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
        padding: '2rem',
        display: 'flex',
        position: 'relative',
        flex: 1,
        backgroundColor: 'white',
        flexDirection: 'column',
      }}
    >
      {/* timeline container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          border: 'solid 1px #aaaaaa',
          borderRadius: '0.5rem',
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
                  {/* Student name on the left */}
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      paddingRight: '0.5rem',
                      minWidth: `${positionFromLeft}px`,
                      maxWidth: `${positionFromLeft}px`,
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textAlign: 'left',
                      }}
                    >
                      {ride.riders[0].firstName} {ride.riders[0].lastName}
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
                        rides[0].status === 'no_show'
                          ? 'rgb(229, 229, 229)'
                          : 'rgb(23, 23, 23)',
                      borderColor:
                        rides[0].status === 'no_show'
                          ? 'rgb(209, 213, 219)'
                          : 'rgb(38, 38, 38)',
                      color:
                        rides[0].status === 'no_show'
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

      {/* current time  */}
      <button
        style={{
          cursor: 'pointer',
          position: 'absolute',
          backgroundColor: 'black',
          border: 'none',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          outline: 'none',
          color: 'white',
          left: '4rem',
          bottom: '4rem',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#525252';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'black';
        }}
        onClick={() => {
          const element = document.getElementById('timeline-current-indicator');
          const parentDiv =
            element?.closest('.overflow-x-scroll') || element?.parentElement;

          if (element && parentDiv) {
            // Get the parent's dimensions and scroll position
            const parentRect = parentDiv.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            // Calculate the scroll position to center the element
            const scrollLeft =
              element.offsetLeft - parentRect.width / 2 + elementRect.width / 2;

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
    </div>
  );
};

export default Schedule;
