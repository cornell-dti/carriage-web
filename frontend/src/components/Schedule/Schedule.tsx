import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import cn from 'classnames';
import moment from 'moment';
import styles from './schedule.module.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './big_calendar_override.css';
import './dnd.scss';

import { CalEvent, tempEvents, resourceMap1, colorMap } from './viewData';

type Driver = {
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
  // const [events, setEvents] = useState<CalEvent[]>([]);
  const [events, setEvents] = useState(tempEvents)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [viewState, setviewState] = useState(false);

  // useEffect(() => {
  //   fetch('/rides')
  //     .then((res) => res.json())
  //     .then(({ data }) => {
  //       console.log(data.filter((ride: any) => ride.type !== "unscheduled"))
  //       setEvents(data
  //         .filter((ride: any) => ride.type !== "unscheduled")
  //         .map((ride: any) => ({
  //           id: ride.id,
  //           title:
  //             "" + ride.startLocation.name + " to " + ride.endLocation.name + "/n" +
  //             "Rider: " + ride.rider.firstName + " " + ride.rider.lastName + "/n" +
  //             "Driver: " + ride.driver.firstName + " " + ride.rider.lastName,
  //           start: ride.startTime,
  //           end: ride.endTime,
  //           resourceId: ride.driver.id
  //         })),
  //       )
  //     }
  //     );
  // });

  useEffect(() => {
    fetch('/drivers')
      .then((res) => res.json())
      .then(({ data }) => setDrivers(
        data.map((driver: any) => ({
          resourceId: driver.id,
          resourceTitle: driver.firstName + " " + driver.lastName
        }))
      ));
  }, []);

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
    // uncomment to view event change details
    // console.log('dragged event:', event.title);
    // console.log('old resourceId:', event.resourceId);
    // console.log('new resourceId:', resourceId);
    const nextEvents = events.map((old) => (old.id === event.id ? { ...old, resourceId } : old));
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
            defaultDate={new Date(2018, 0, 29)} // temp date
            // resources={resourceMap1}
            resources={drivers}
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
      <button className={styles.view_state} onClick={() => setviewState(!viewState)}>
        view {viewState ? 'less' : 'more'}
      </button>
    </>
  );
};

export default Schedule;
