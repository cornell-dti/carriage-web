import React, { FunctionComponent, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './big_calendar_override.css';
import styles from './schedule.module.css';

const localizer = momentLocalizer(moment);

type CalEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resourceId: number;
};

// events on temp date
const events: CalEvent[] = [
  {
    id: 0,
    title: 'Baker Flagpole to Warren Hall',
    start: new Date(2018, 0, 29, 9, 0, 0),
    end: new Date(2018, 0, 29, 9, 30, 0),
    resourceId: 1,
  },
  {
    id: 1,
    title: 'Eddygate to Hollister Hall',
    start: new Date(2018, 0, 29, 8, 50, 0),
    end: new Date(2018, 0, 29, 9, 50, 0),
    resourceId: 1,
  },
  {
    id: 2,
    title: 'RPCC to Gates Hall',
    start: new Date(2018, 0, 29, 9, 30, 0),
    end: new Date(2018, 0, 29, 12, 30, 0),
    resourceId: 3,
  },
  {
    id: 3,
    title: 'Becker to Mallot',
    start: new Date(2018, 0, 29, 12, 0, 0),
    end: new Date(2018, 0, 29, 12, 30, 0),
    resourceId: 4,
  },
  {
    id: 11,
    title: 'Uris Hall to Uris Library',
    start: new Date(2018, 0, 29, 7, 0, 0),
    end: new Date(2018, 0, 29, 10, 30, 0),
    resourceId: 4,
  },
];

const resourceMap1 = [
  { resourceId: 1, resourceTitle: "DRIVER'S NAME" },
  { resourceId: 2, resourceTitle: 'MARTHA STUART' },
  { resourceId: 3, resourceTitle: 'FOO BAR' },
  { resourceId: 4, resourceTitle: 'JOHN SMITH' },
  { resourceId: 5, resourceTitle: 'SAM PIKE' },
  { resourceId: 6, resourceTitle: 'MYLES HALLS' },
  { resourceId: 7, resourceTitle: 'BENSON HOLMES' },
];

const colorMap = {
  red: ['FFA26B', 'FFC7A6'],
  blue: ['0084F4', '66B5F8'],
  yellow: ['FFCF5C', 'FFE29D'],
  green: ['00C48C', '7DDFC3'],
  black: ['1A051D', 'FBE4E8'],
};

const Schedule: FunctionComponent = () => {
  const defaultStart = new Date();
  defaultStart.setHours(8, 0, 0, 0);
  const [curStart, setCurStart] = useState(defaultStart);

  // TODO: change button colors when you can no longer go up or down

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

  const filterEvents = (allEvents: CalEvent[]) => {
    const c = curStart.getHours();
    return allEvents.filter(({ start, end }) => {
      const s = start.getHours();
      const e = end.getHours();
      const outOfBounds = s < c && c + 1 < e;
      return s === c || s === c + 1 || e === c || e === c || outOfBounds;
    });
  };

  return (
    <>
      <h1 className={styles.heading}>Home</h1>
      <div className={styles.calendar_container}>
        <div className={styles.left}>
          <Calendar
            formats={{
              timeGutterFormat: 'h A',
            }}
            localizer={localizer}
            events={filterEvents(events)}
            toolbar={false}
            step={60}
            timeslots={1}
            showMultiDayTimes={true}
            defaultView="day"
            min={curStart}
            max={new Date(curStart.getTime() + 7199999)} // 2 hrs
            defaultDate={new Date(2018, 0, 29)}
            resources={resourceMap1}
            resourceIdAccessor="resourceId"
            resourceTitleAccessor="resourceTitle"
            eventPropGetter={eventStyle}
          />
        </div>
        <div className={styles.right}>
          <div>
            <button className={styles.btn} onClick={goUp}>
              <i className={styles.uparrow}></i>
            </button>
            <span className={styles.pad}></span>
            <button className={styles.btn} onClick={goDown}>
              <i className={styles.downarrow}></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Schedule;
