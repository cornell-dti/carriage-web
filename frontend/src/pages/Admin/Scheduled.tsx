import {
  Accessible,
  AirportShuttle,
  AssistWalker,
  CalendarToday,
  ChevronLeft,
  ChevronRight,
  Moped,
  Pets,
  ViewList,
  VisibilityOff,
  WheelchairPickup,
} from '@mui/icons-material';
import React, { FC, HTMLAttributes, useEffect, useMemo, useState } from 'react';
import { useRides } from '../../context/RidesContext';
import { Accessibility, Ride } from '../../types';
import moment from 'moment';
import {
  PillButton,
  BoxButton,
  ButtonAccent,
} from '../../components/Button/Button';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import styles from './Scheduled.module.css';

const TitlePill: FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
}) => <div className={`${styles.titlePill} ${className}`}>{children}</div>;

const AccessibilityIcon: FC<{ type: Accessibility }> = ({ type }) => {
  switch (type) {
    case Accessibility.ASSISTANT:
      return <WheelchairPickup />;
    case Accessibility.CRUTCHES:
      return <AssistWalker />;
    case Accessibility.WHEELCHAIR:
      return <Accessible />;
    case Accessibility.MOTOR_SCOOTER:
      return <Moped />;
    case Accessibility.KNEE_SCOOTER:
      return <Accessible />;
    case Accessibility.LOW_VISION:
      return <VisibilityOff />;
    case Accessibility.SERVICE_ANIMALS:
      return <Pets />;
    default:
      return null;
  }
};

// Component to render all accessibility icons for a rider
const AccessibilityIcons: FC<{ accessibilities?: Accessibility[] }> = ({
  accessibilities,
}) => {
  if (!accessibilities || accessibilities.length === 0)
    return <p className={styles.fullWidthLeft}>None</p>;

  return (
    <div className={styles.accessibilityIconsContainer}>
      {/* Use Set to remove duplicates (e.g., if multiple wheelchair-type needs) */}
      {[...new Set(accessibilities)].map((type, index) => (
        <AccessibilityIcon key={index} type={type} />
      ))}
    </div>
  );
};

enum SortMode {
  PickupTime,
  DropoffTime,
}

interface ScheduledTableProps {
  rides: Ride[];
  selected: Ride | undefined;
  handleSelection: (selectionChange: Ride | undefined) => void;
  handleSortChange: (sortMode: SortMode) => void;
}

const ScheduledTable: FC<ScheduledTableProps> = ({
  rides,
  selected,
  handleSelection,
  handleSortChange,
}) => {
  return (
    <div className={styles.tableWrapper}>
      {/* search and filter options */}
      <div className={styles.filterBar}>
        {/* filter left */}
        <div className={styles.filterLeft}>
          {/* filter */}
          <FormControl size="small">
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              label="sortBy"
              name="sort by"
              onChange={(e) => {
                handleSortChange(e.target.value as SortMode);
              }}
              className="min-w-32"
              defaultValue={SortMode.PickupTime}
            >
              <MenuItem value={SortMode.PickupTime}>Pickup</MenuItem>
              <MenuItem value={SortMode.DropoffTime}>Dropoff</MenuItem>
            </Select>
          </FormControl>
        </div>
        {/* filter right */}
        <div className={styles.filterRight}>
          {/* add ride */}
          {/* <PillButton accent={ButtonAccent.PRIMARY}>
            <p>Add Ride</p>
            <AirportShuttle></AirportShuttle>
          </PillButton> */}
        </div>
      </div>
      {/* table header */}
      <div className={styles.tableHeader}>
        <p className={styles.studentColumn}>Student</p>
        <p className={styles.needsColumn}>Needs</p>
        <p className={styles.timeColumn}>Start</p>
        <p className={styles.timeColumn}>End</p>
        <p className={styles.locationColumn}>Pickup</p>
        <p className={styles.locationColumn}>Dropoff</p>
        <p className={styles.noShowColumn}>No Show</p>
      </div>

      {/* table rows */}
      <div className={styles.tableRows}>
        {rides.map((ride, idx) => {
          let rowClassName = '';
          if (ride.noShow) {
            rowClassName =
              selected === ride
                ? styles.tableRowNoShowSelected
                : styles.tableRowNoShow;
          } else {
            rowClassName =
              selected === ride
                ? styles.tableRowSelected
                : styles.tableRowNormal;
          }

          return (
            <button
              id={`${ride.id}-table`}
              className={`${styles.tableRow} ${rowClassName}`}
              key={idx}
              onClick={() =>
                selected === ride
                  ? handleSelection(undefined)
                  : handleSelection(ride)
              }
            >
              <p
                className={styles.studentColumn}
              >{`${ride.rider.firstName} ${ride.rider.lastName}`}</p>
              <div className={styles.needsColumn}>
                <AccessibilityIcons
                  accessibilities={ride.rider.accessibility}
                />
              </div>
              <p className={styles.timeColumn}>
                {moment(ride.startTime).format('h:mm A')}
              </p>
              <p className={styles.timeColumn}>
                {moment(ride.endTime).format('h:mm A')}
              </p>
              <p className={styles.locationColumn}>{ride.startLocation.name}</p>
              <p className={styles.locationColumn}>{ride.endLocation.name}</p>
              <p className={styles.noShowColumn}>
                {ride.noShow ? 'Yes' : 'No'}
              </p>
            </button>
          );
        })}
      </div>
    </div>
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
                ride.startTime,
                ride.endTime
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
                      {ride.rider.firstName} {ride.rider.lastName}
                    </p>
                  </div>

                  {/* Ride block with start time */}
                  <button
                    className={`${styles.rideBlock} ${
                      ride.noShow
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
                          ride.noShow
                            ? styles.rideTimeTextNoShow
                            : styles.rideTimeTextNormal
                        }`}
                      >
                        {ride.startTime.getHours() % 12 || 12}:
                        {ride.startTime
                          .getMinutes()
                          .toString()
                          .padStart(2, '0')}
                        {ride.startTime.getHours() >= 12 ? 'PM' : 'AM'}
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
      <BoxButton
        className={styles.currentTimeButton}
        accent={ButtonAccent.PRIMARY}
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
      </BoxButton>
    </div>
  );
};

const Scheduled: FC = () => {
  const { scheduledRides, unscheduledRides } = useRides();
  const [sortMode, setSortMode] = useState<SortMode>(SortMode.PickupTime);
  const [selected, setSelected] = useState<Ride | undefined>(undefined);

  const renderedRides = useMemo(() => {
    if (sortMode === SortMode.PickupTime) {
      return [...scheduledRides].toSorted(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
      );
    } else if (sortMode === SortMode.DropoffTime) {
      return [...scheduledRides].toSorted(
        (a, b) => a.endTime.getTime() - b.endTime.getTime()
      );
    } else return scheduledRides;
  }, [sortMode, scheduledRides]);

  const noShow = useMemo(() => {
    return renderedRides.filter((ride) => ride.noShow);
  }, [renderedRides]);

  // Helper function to check if element is in viewport
  const isElementInViewport = (el: Element) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  const handleSelection = (updatedSelection: Ride | undefined) => {
    setSelected(updatedSelection);

    if (updatedSelection) {
      // Check and scroll to table element
      const tableElement = document.getElementById(
        `${updatedSelection.id}-table`
      );
      if (tableElement && !isElementInViewport(tableElement)) {
        tableElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Check and scroll to timeline element
      const timelineElement = document.getElementById(
        `${updatedSelection.id}-timeline`
      );
      if (timelineElement && !isElementInViewport(timelineElement)) {
        timelineElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* header */}
      <div className={styles.header}>
        {/* header-left */}
        <div className={styles.headerLeft}>
          {/* page title */}
          <div className={styles.pageTitle}>
            <h1 className={styles.pageTitleText}>Scheduled Rides</h1>
          </div>
          {/* date changer button */}
          <TitlePill>
            <button className={styles.chevronButton}>
              <ChevronLeft></ChevronLeft>
            </button>

            <p>Today | April 23, 2025</p>
            <CalendarToday></CalendarToday>
            <button className={styles.chevronButton}>
              <ChevronRight></ChevronRight>
            </button>
          </TitlePill>
        </div>
        {/* header-right  */}
        <div className={styles.headerRight}>
          <TitlePill>
            {/* title pill text element */}
            <div className={styles.pillTextElement}>
              <p className={styles.pillTextLarge}>{renderedRides.length}</p>
              <p>Total Rides</p>
            </div>
            {/* title pill text element */}
            <div className={styles.pillTextElement}>
              <p className={styles.pillTextLarge}>{noShow.length}</p>
              <p>Recorded No-Shows</p>
            </div>
            <PillButton accent={ButtonAccent.POSITIVE}>
              <p className="text-[#296831]">Export to Excel</p>
              <ViewList className="text-[#296831]"></ViewList>
            </PillButton>
          </TitlePill>
        </div>
      </div>
      {/* body container */}
      <div className={styles.bodyContainer}>
        {/* table container */}
        <div className={styles.tableContainer}>
          <ScheduledTable
            rides={renderedRides}
            selected={selected}
            handleSelection={handleSelection}
            handleSortChange={(newSortMode) => {
              setSortMode(newSortMode);
            }}
          ></ScheduledTable>
        </div>
        <div className={styles.timelineContainer}>
          <ScheduledTimeline
            rides={renderedRides}
            selected={selected}
            handleSelection={handleSelection}
          ></ScheduledTimeline>
        </div>
      </div>
    </div>
  );
};

export default Scheduled;
