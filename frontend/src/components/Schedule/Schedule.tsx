import React, {
  ComponentType,
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
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './big_calendar_override.css';
import styles from './schedule.module.css';
import Modal from '../RideStatus/SModal';
import { useEmployees } from '../../context/EmployeesContext';
import { useRides } from '../../context/RidesContext';
import axios from '../../util/axios';

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
      scheduledRides.map((ride: Ride) => ({
        id: ride.id,
        title: `${ride.startLocation.name} to ${ride.endLocation.name}
Rider: ${ride.rider.firstName} ${ride.rider.lastName}`,
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
    const { recurring } = ride;
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
            timeslots={12}
            showMultiDayTimes={true}
            events={events}
            defaultView="day"
            onSelectEvent={onSelectEvent}
            min={minTime}
            max={maxTime}
            date={scheduleDay}
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

export default Schedule;
