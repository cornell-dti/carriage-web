import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import cn from 'classnames';
import moment from 'moment';
import styles from './schedule.module.css';
import { Ride, Driver } from '../../types';
import { useReq } from '../../context/req';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './big_calendar_override.css';
import './dnd.scss';

const colorMap = {
  red: ['FFA26B', 'FFC7A6'],
  blue: ['0084F4', '66B5F8'],
  yellow: ['FFCF5C', 'FFE29D'],
  green: ['00C48C', '7DDFC3'],
  black: ['1A051D', 'FBE4E8'],
};

type CalEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resourceId: number;
};

type CalendarDriver = {
  resourceId: string,
  resourceTitle: string
}

const localizer = momentLocalizer(moment);

const DnDCalendar = withDragAndDrop<any, any>(Calendar);

const Schedule = () => {
  const defaultStart = new Date();
  defaultStart.setHours(8, 0, 0, 0);
  const defaultEnd = new Date(defaultStart.getTime() + 28699999);

  const [curStart, setCurStart] = useState(defaultStart);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [calDrivers, setCalDrivers] = useState<CalendarDriver[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [viewState, setviewState] = useState(false);

  const {withDefaults} = useReq();

  useEffect(() => {
    fetch('/api/rides', withDefaults())
      .then((res) => res.json())
      .then(({ data }) => {
        setEvents(data
          .filter((ride: Ride) => ride.type !== "unscheduled")
          .map((ride: Ride) => ({
            id: ride.id,
            title:
              `${ride.startLocation.name} to ${ride.endLocation.name}
Rider: ${ride.rider.firstName} ${ride.rider.lastName}`,
            start: new Date(ride.startTime.toString()),
            end: new Date(ride.endTime.toString()),
            resourceId: ride.driver!.id
          })))
      });
  }, [withDefaults]);

  useEffect(() => {
    fetch('/api/drivers', withDefaults())
      .then((res) => res.json())
      .then(({ data }) => {
        setDrivers(data);
        setCalDrivers(
          data.map((driver: any) => ({
            resourceId: driver.id,
            resourceTitle: `${driver.firstName} ${driver.lastName}`
          }))
        )
      });
  }, [withDefaults]);

  const updateRides = (rideId: string, updatedDriver: Driver) => {
    fetch(`/api/rides/${rideId}`, withDefaults({
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driver: updatedDriver }),
    }));
  }

  const goUp = () => {
    if (curStart.getHours() > 0) {
      setCurStart(new Date(curStart.getTime() - 7200000));
    }
  };
  const goDown = () => {
    if (curStart.getHours() < 22) {
      setCurStart(new Date(curStart.getTime() + 7200000));
    }
  };

  const getColor = (id: number) => {
    switch (id % 10) {
      case 0:
        return 'red';
      case 1:
        return 'blue';
      case 2:
        return 'green';
      case 3:
        return 'yellow';
      default:
        return 'black';
    }
  };

  const eventStyle = (event: CalEvent) => {
    const color = colorMap[getColor(event.id)];
    return {
      style: {
        borderLeft: `4px solid #${color[0]}`,
        backgroundColor: `#${color[1]}`,
        borderRadius: 0,
        color: 'black',
      },
    };
  };

  const slotStyle = (d: Date) => ({
    style: {
      borderTop: d.getMinutes() !== 0 ? 'none' : '1px solid rgba(0, 0, 0, 15%)',
    },
  });

  const filterEvents = (allEvents: CalEvent[]) => {
    const c = curStart.getHours();
    return allEvents.filter(({ start, end }) => {
      const s = start.getHours();
      const e = end.getHours();
      const outOfBounds = s < c && c + 1 < e;
      return s === c || s === c + 1 || e === c || e === c || outOfBounds;
    });
  };

  const onEventDrop = ({ start, end, event, resourceId }: any) => {
    const nextEvents = events.map(
      (old) => (old.id === event.id ? { ...old, resourceId } : old));

    const updatedDriver = drivers.find(d => d.id === resourceId);
    if (updatedDriver !== undefined) {
      updateRides(event.id, updatedDriver)
    }
    setEvents(nextEvents);
  };

  // eslint-disable-next-line no-alert
  const onSelectEvent = (event: any) => alert(event.title);

  const okHr = (hr: number) => viewState || hr === curStart.getHours();

  return (
    <>
      <h1 className={styles.heading}>Home</h1>
      <div
        className={cn(styles.calendar_container, { [styles.long]: viewState })}
      >
        <div className={cn(styles.left, { [styles.long]: viewState })}>
          <DnDCalendar
            resizable={false}
            formats={{ timeGutterFormat: 'h A' }}
            localizer={localizer}
            events={filterEvents(events)}
            toolbar={false}
            step={5}
            timeslots={12}
            showMultiDayTimes={true}
            defaultView="day"
            onEventDrop={onEventDrop}
            selectable
            onSelectEvent={onSelectEvent}
            min={viewState ? defaultStart : curStart}
            max={
              viewState ? defaultEnd : new Date(curStart.getTime() + 7199999)
            }
            defaultDate={new Date()}
            resources={calDrivers}
            resourceIdAccessor="resourceId"
            resourceTitleAccessor="resourceTitle"
            eventPropGetter={eventStyle}
            slotPropGetter={slotStyle}
          />
        </div>
        <div className={cn(styles.right, { [styles.long]: viewState })}>
          <div>
            <button className={styles.btn} onClick={goUp} disabled={okHr(0)}>
              <i className={styles.uparrow}></i>
            </button>
            <span className={styles.pad}></span>
            <button className={styles.btn} onClick={goDown} disabled={okHr(22)}>
              <i className={styles.downarrow}></i>
            </button>
          </div>
        </div>
      </div>
      <button
        className={styles.view_state}
        onClick={() => setviewState(!viewState)}
      >
        view {viewState ? 'less' : 'more'}
      </button>
    </>
  );
};

export default Schedule;
