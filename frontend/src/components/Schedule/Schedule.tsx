import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import styles from './schedule.module.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './big_calendar_override.css';

import { CalEvent, tempEvents, resourceMap1, colorMap } from './temp_data';

const localizer = momentLocalizer(moment);

const DnDCalendar = withDragAndDrop<any, any>(Calendar);


const Schedule = () => {
  const defaultStart = new Date();
  defaultStart.setHours(8, 0, 0, 0);
  const [curStart, setCurStart] = useState(defaultStart);
  const [events, setEvents] = useState(tempEvents);
  const [tempId, setTempId] = useState(100);

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
    const nextEvents = events.map((old) => (old.id === event.id
      ? { ...old, start: new Date(start), end: new Date(end), resourceId }
      : old));
    setEvents(nextEvents);
  };

  // eslint-disable-next-line no-alert
  const onSelectEvent = (event: any) => alert(event.title);

  const onSelectSlot = ({ start, end, resourceId }: any) => {
    // eslint-disable-next-line no-alert
    const title = window.prompt('New Ride name');
    if (title) {
      const newEvent: CalEvent = {
        start: new Date(start),
        end: new Date(end),
        title,
        id: tempId,
        resourceId,
      };
      setTempId(tempId + 1);
      setEvents([...events, newEvent]);
    }
  };

  const okHr = (hr: number) => hr === curStart.getHours();

  return (
    <>
      <h1 className={styles.heading}>Home</h1>
      <div className={styles.calendar_container}>
        <div className={styles.left}>
          <DnDCalendar
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
            onSelectSlot={onSelectSlot}
            min={curStart}
            max={new Date(curStart.getTime() + 7199999)} // 2 hrs
            defaultDate={new Date(2018, 0, 29)} // temp date
            resources={resourceMap1}
            resourceIdAccessor="resourceId"
            resourceTitleAccessor="resourceTitle"
            eventPropGetter={eventStyle}
            slotPropGetter={slotStyle}
          />
        </div>
        <div className={styles.right}>
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
    </>
  );
};

export default Schedule;
