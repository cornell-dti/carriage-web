import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import cn from 'classnames';
import moment from 'moment';
import { Ride, Driver } from '../../types';
import { useReq } from '../../context/req';
import { useDate } from '../../context/date';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './big_calendar_override.css';
import styles from './schedule.module.css';
import Modal from '../RideStatus/SModal';
import { useEmployees } from '../../context/EmployeesContext';
import { useRides } from '../../context/RidesContext';

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
  const DnDCalendar = withDragAndDrop<any, any>(Calendar);
  const { withDefaults } = useReq();
  const { activeRides, refreshRides } = useRides();

  const scheduleDay = useDate().curDate;
  console.log(scheduleDay);
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
    console.log('rides got');
    console.log(activeRides);
    setEvents(
      activeRides.map((ride: Ride) => ({
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
    console.log('events', events);
  }, [events]);

  useEffect(() => {
    getRides();
  }, [activeRides]);

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
      fetch(
        `api/rides/${rideId}/edits`,
        withDefaults({
          method: 'PUT',
          body: JSON.stringify({ deleteOnly: 'true', origDate: scheduleDay }),
        })
      )
        .then(refreshRides)
        .then(closeModal);
    } else {
      fetch(`/api/rides/${rideId}`, withDefaults({ method: 'DELETE' }))
        .then(refreshRides)
        .then(closeModal);
    }
  };

  const updateRides = (rideId: string, updatedDriver: Driver) => {
    fetch(
      `/api/rides/${rideId}`,
      withDefaults({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver: updatedDriver }),
      })
    ).then(refreshRides);
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
          <DnDCalendar
            resizable={true}
            onEventDrop={onEventDrop}
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
