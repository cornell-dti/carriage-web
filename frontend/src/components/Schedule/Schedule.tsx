import React, { useCallback, useEffect, useState, useRef } from 'react';
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

const colorMap = new Map<string, string[]>([
  ['red', ['FFA26B', 'FFC7A6']],
  ['blue', ['0084F4', '66B5F8']],
  ['yellow', ['FFCF5C', 'FFE29D']],
  ['green', ['00C48C', '7DDFC3']],
  ['black', ['1A051D', 'FBE4E8']],
]);
const colorIds = ['red', 'blue', 'yellow', 'green', 'black'];

type CalEvent = {
  id: number;
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

const HR1 = 3600000;
const HR2 = 7200000;
const HR8 = 28800000;

const Schedule = () => {
  const componentMounted = useRef(true);
  const localizer = momentLocalizer(moment);
  const DnDCalendar = withDragAndDrop<any, any>(Calendar);
  const { withDefaults } = useReq();

  const scheduleDay = useDate().curDate;
  scheduleDay.setHours(0, 0, 0, 0);
  const defaultStart = scheduleDay;
  defaultStart.setHours(8, 0, 0, 0);

  const [lessTime, setLessTime] = useState([
    defaultStart,
    new Date(defaultStart.getTime() + HR2 - 1),
  ]);
  const [moreTime, setMoreTime] = useState([
    defaultStart,
    new Date(defaultStart.getTime() + HR8 - 1),
  ]);

  const [events, setEvents] = useState<CalEvent[]>([]);
  const [calDrivers, setCalDrivers] = useState<CalendarDriver[]>([]);
  const { drivers } = useEmployees();
  const [viewMore, setViewMore] = useState(false);
  const [currentRide, setCurrentRide] = useState<Ride | undefined>(undefined);
  const [colorIdMap, setColorIdMap] = useState(new Map<string, string>());

  const [isOpen, setIsOpen] = useState(false);
  const closeModal = () => setIsOpen(false);

  const getRides = useCallback(() => {
    const today = moment(scheduleDay).format('YYYY-MM-DD');
    fetch(`/api/rides?date=${today}&scheduled=true`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => {
        if (data && !componentMounted.current) {
          setEvents(
            data.map((ride: Ride) => ({
              id: ride.id,
              title: `${ride.startLocation.name} to ${ride.endLocation.name}
Rider: ${ride.rider.firstName} ${ride.rider.lastName}`,
              start: new Date(ride.startTime.toString()),
              end: new Date(ride.endTime.toString()),
              resourceId: ride.driver!.id,
              ride,
            }))
          );
        }
      });
  }, [componentMounted, scheduleDay, withDefaults]);

  useEffect(() => {
    getRides();
    return () => {
      componentMounted.current = false;
    };
  }, [getRides]);

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

  const goUp = () => {
    if (viewMore) {
      if (moreTime[0].getHours() > 0) {
        setMoreTime([
          new Date(moreTime[0].getTime() - HR1),
          new Date(moreTime[1].getTime() - HR1),
        ]);
      }
    } else if (lessTime[0].getHours() > 0) {
      setLessTime([
        new Date(lessTime[0].getTime() - HR2),
        new Date(lessTime[1].getTime() - HR2),
      ]);
    }
  };

  const goDown = () => {
    if (viewMore) {
      if (moreTime[0].getHours() < 16) {
        setMoreTime([
          new Date(moreTime[0].getTime() + HR1),
          new Date(moreTime[1].getTime() + HR1),
        ]);
      }
    } else if (lessTime[0].getHours() < 22) {
      setLessTime([
        new Date(lessTime[0].getTime() + HR2),
        new Date(lessTime[1].getTime() + HR2),
      ]);
    }
  };

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

  const filterEvents = (allEvents: CalEvent[]) => {
    const timeStart = viewMore
      ? moreTime[0].getHours()
      : lessTime[0].getHours();
    const timeEnd = timeStart + (viewMore ? 7 : 1);
    const filtered = allEvents.filter(({ start, end }) => {
      const s = start.getHours();
      const e = end.getHours();
      const startsInBounds = s >= timeStart && s <= timeEnd;
      const endsInBounds = e >= timeStart && e <= timeEnd;
      const partlyInBounds = s < timeStart && timeEnd < e;
      return startsInBounds || endsInBounds || partlyInBounds;
    });
    return filtered;
  };

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
        .then(() => getRides())
        .then(closeModal);
    } else {
      fetch(`/api/rides/${rideId}`, withDefaults({ method: 'DELETE' }))
        .then(() => getRides())
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
    );
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

  moreTime[0].setHours(7);
  moreTime[1].setHours(23);
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
            resizable={false}
            onEventDrop={onEventDrop}
            formats={{ timeGutterFormat: 'h A' }}
            localizer={localizer}
            toolbar={false}
            step={5}
            timeslots={12}
            showMultiDayTimes={true}
            events={filterEvents(events)}
            defaultView="day"
            onSelectEvent={onSelectEvent}
            min={moreTime[0]}
            max={moreTime[1]}
            date={scheduleDay}
            onNavigate={() => {}}
            scrollToTime={moreTime[1]}
            resources={calDrivers}
            resourceIdAccessor="resourceId"
            resourceTitleAccessor="resourceTitle"
            eventPropGetter={eventStyle}
            slotPropGetter={slotStyle}
          />
        </div>
        {/* <div className={cn(styles.right, { [styles.long]: viewMore })}>
          <div>
            <button
              className={styles.btn}
              onClick={goUp}
              disabled={disableHr(true)}
            >
              <span
                className={styles.uparrow}
                role="img"
                aria-label={'up arrow'}
              />
            </button>
            <span className={styles.pad} />
            <button
              className={styles.btn}
              onClick={goDown}
              disabled={disableHr(false)}
            >
              <span
                className={styles.downarrow}
                role="img"
                aria-label={'down arrow'}
              />
            </button>
          </div>
        </div> */}
      </div>
      <button className={styles.view_state} onClick={handleChangeViewState}>
        view {viewMore ? 'less' : 'more'}
      </button>
    </>
  );
};

export default Schedule;
