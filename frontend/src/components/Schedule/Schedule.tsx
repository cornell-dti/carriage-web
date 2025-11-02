import React, {
  ComponentType,
  FC,
  JSXElementConstructor,
  PropsWithChildren,
  ReactElement,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Calendar,
  EventWrapperProps,
  momentLocalizer,
} from 'react-big-calendar';
import cn from 'classnames';
import moment from 'moment';
import { Ride, Driver } from '../../types';
import { useDate } from '../../context/date';
import styles from './schedule.module.css';
import Modal from '../RideStatus/SModal';
import { useEmployees } from '../../context/EmployeesContext';
import { useRides } from '../../context/RidesContext';
import axios from '../../util/axios';
import { newDate } from 'react-datepicker/dist/date_utils';
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

  console.log(scheduledRides);
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

  const updateRides = (rideId: string, updatedDriver: Driver) => {
    axios
      .put(`/api/rides/${rideId}`, { driver: updatedDriver })
      .then(refreshRides);
  };

  const onEventDrop = ({ event, resourceId }: any) => {
    const nextEvents = events.map((old) =>
      old.id === event.id ? { ...old, resourceId } : old
    );

    const updatedDriver = drivers.find((d: Driver) => d.id === resourceId);
    if (updatedDriver !== undefined) {
      updateRides(event.id, updatedDriver);
    }
    setEvents(nextEvents);
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
          <Calendar
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
          />
        </div>
      </div>
      <button className={styles.view_state} onClick={handleChangeViewState}>
        view {viewMore ? 'less' : 'more'}
      </button>
    </>
  );
};

interface ScheduledTimelineProps {
  rides: Ride[];
  selected: Ride | undefined;
  handleSelection: (selectionChange: Ride | undefined) => void;
  leftOffset?: number;
  halfHourWidth?: number;
}

const ScheduledTimeline: FC<ScheduledTimelineProps> = ({
  rides,
  selected,
  handleSelection,
  leftOffset = 16,
  halfHourWidth = 300,
}) => {
  const timeLabels = useMemo(() => {
    const labels = [];
    const startTime = new Date();
    startTime.setHours(7, 0, 0); // 7:00 AM

    const endTime = new Date();
    endTime.setHours(15, 30, 0); // 3:30 PM

    let currentTime = new Date(startTime);

    while (currentTime <= endTime) {
      labels.push(moment(currentTime).format('h:mm A'));

      currentTime = new Date(currentTime.getTime() + 30 * 60000);
    }

    return labels;
  }, []);

  const minuteWidth = useMemo(() => halfHourWidth / 30, [halfHourWidth]);

  const baseTime = new Date();
  baseTime.setHours(7);

  const calculateRidePosition = (startTime: Date, endTime: Date) => {
    // Calculate minutes from 7:00 AM
    const startMinutesFromBase =
      (startTime.getTime() - baseTime.getTime()) / (60 * 1000);
    const endMinutesFromBase =
      (endTime.getTime() - baseTime.getTime()) / (60 * 1000);

    // Calculate position and width
    const positionFromLeft = startMinutesFromBase * minuteWidth;
    const width = (endMinutesFromBase - startMinutesFromBase) * minuteWidth;

    return { positionFromLeft, width };
  };

  return (
    <div className={styles.timelineOuterContainer}>
      {/* timeline container */}
      <div className={styles.timelineContainer}>
        {/* timeline horizontal scroll */}
        <div className={styles.timelineScroll}>
          {/* tick labels */}
          <div className={styles.tickLabels} style={{ marginLeft: leftOffset }}>
            {timeLabels.map((timeLabel, idx) => (
              <div
                key={idx}
                className={styles.tickLabel}
                style={{
                  width: halfHourWidth,
                  maxWidth: halfHourWidth,
                  minWidth: halfHourWidth,
                }}
              >
                <p className={styles.tickLabelText}>{timeLabel}</p>
              </div>
            ))}
          </div>
          {/* timeline lines for rides */}
          <div
            className={styles.timelineRidesContainer}
            style={{ width: `${halfHourWidth * timeLabels.length}px` }}
          >
            {rides.map((ride, idx) => {
              const { positionFromLeft, width } = calculateRidePosition(
                new Date(ride.startTime),
                new Date(ride.endTime)
              );

              return (
                <div
                  key={idx}
                  className={styles.rideRow}
                  id={`${ride.id}-timeline`}
                >
                  {/* Student name on the left */}
                  <div
                    className={styles.rideNameContainer}
                    style={{
                      left: `${leftOffset}px`,
                      minWidth: `${positionFromLeft}px`,
                      maxWidth: `${positionFromLeft}px`,
                    }}
                  >
                    <p className={styles.rideName}>
                      {ride.riders[0].firstName} {ride.riders[0].lastName}
                    </p>
                  </div>

                  {/* Ride block with start time */}
                  <button
                    className={`${styles.rideBlock} ${
                      rides[0].status === 'no_show'
                        ? styles.rideBlockNoShow
                        : styles.rideBlockNormal
                    }`}
                    style={{
                      left: `${leftOffset + positionFromLeft}px`,
                      width: `${Math.max(width, 50)}px`, // Minimum width for visibility
                    }}
                    onClick={() =>
                      selected === ride
                        ? handleSelection(undefined)
                        : handleSelection(ride)
                    }
                  >
                    <div className="flex flex-col justify-center">
                      <p
                        className={`${styles.rideTimeText} ${
                          // status access
                          rides[0].status === 'no_show'
                            ? styles.rideTimeTextNoShow
                            : styles.rideTimeTextNormal
                        }`}
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
            className={styles.tickMarksContainer}
            style={{ left: leftOffset }}
          >
            {timeLabels.map((_timeLabel, idx) => (
              <div
                key={idx}
                className={styles.tickMark}
                style={{
                  left: `${leftOffset + idx * halfHourWidth}px`,
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
            className={styles.currentTimeLine}
            style={{
              left:
                leftOffset +
                ((new Date().getTime() - baseTime.getTime()) / (60 * 1000)) *
                  minuteWidth,
            }}
          ></div>
        </div>
      </div>

      {/* current time  */}
      <Button
        className={styles.currentTimeButton}
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
        <p>{`Now: ${moment(Date.now()).format('h:mm A')}`}</p>
      </Button>
    </div>
  );
};

export default Schedule;
