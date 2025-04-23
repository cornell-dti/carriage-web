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

const TitlePill: FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
}) => (
  <div
    className={`min-h-[55px] w-min rounded-full flex gap-4 px-2 py-1.5 items-center bg-white border border-neutral-300 ${className}`}
  >
    {children}
  </div>
);

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
    return <p className="w-full text-left">None</p>;

  return (
    <div className="flex gap-1">
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
    <div className="flex flex-col w-full h-full items-center">
      {/* search and filter options */}
      <div className="flex w-full p-4 items-center justify-between border-b border-neutral-300">
        {/* filter left */}
        <div className="w-min h-min flex items-center gap-4 text-neutral-800">
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
        <div className="w-min h-min flex items-center gap-4 text-neutral-800">
          {/* add ride */}
          {/* <PillButton accent={ButtonAccent.PRIMARY}>
            <p>Add Ride</p>
            <AirportShuttle></AirportShuttle>
          </PillButton> */}
        </div>
      </div>
      {/* table header */}
      <div className="w-full h-min flex items-center justify-between text-neutral-500 px-4 py-1.5 border-b border-neutral-300">
        <p className="w-[200px]">Student</p>
        <p className="w-[150px]">Needs</p>
        <p className="w-[150px]">Start</p>
        <p className="w-[150px]">End</p>
        <p className="w-[150px]">Pickup</p>
        <p className="w-[150px]">Dropoff</p>
        <p className="w-[150px]">No Show</p>
      </div>

      {/* table rows */}
      <div
        className="w-full h-72 overflow-y-scroll flex
      justify-between flex-col "
      >
        {rides.map((ride, idx) => (
          <button
            id={`${ride.id}-table`}
            className={`w-full h-min flex items-center justify-between text-neutral-700 px-4 py-1.5 
              ${
                ride.noShow
                  ? selected === ride
                    ? 'bg-neutral-300 text-neutral-700 hover:bg-neutral-400'
                    : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                  : selected === ride
                  ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  : 'bg-white text-neutral-700 hover:bg-neutral-200'
              } 
              `}
            key={idx}
            onClick={() =>
              selected === ride
                ? handleSelection(undefined)
                : handleSelection(ride)
            }
          >
            <p className="w-[200px]">{`${ride.rider.firstName} ${ride.rider.lastName}`}</p>
            <div className="w-[150px]">
              <AccessibilityIcons accessibilities={ride.rider.accessibility} />
            </div>
            <p className="w-[150px]">
              {moment(ride.startTime).format('h:mm A')}
            </p>
            <p className="w-[150px]">{moment(ride.endTime).format('h:mm A')}</p>
            <p className="w-[150px]">{ride.startLocation.name}</p>
            <p className="w-[150px]">{ride.endLocation.name}</p>
            <p className="w-[150px]">{ride.noShow ? 'Yes' : 'No'}</p>
          </button>
        ))}
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
    <div className="w-full flex relative flex-1 bg-white rounded-lg flex-col">
      {/* timeline container */}
      <div className="w-full h-full flex items-center justify-center p-4">
        {/* timeline horizontal scroll */}
        <div className="w-full h-full overflow-x-scroll flex-col relative">
          {/* tick labels */}
          <div
            className="w-full flex pointer-events-none"
            style={{ marginLeft: leftOffset }}
          >
            {timeLabels.map((timeLabel, idx) => (
              <div
                key={idx}
                className="flex justify-start pl-0.5"
                style={{
                  width: halfHourWidth,
                  maxWidth: halfHourWidth,
                  minWidth: halfHourWidth,
                }}
              >
                <p className="text-neutral-400 text-nowrap">{timeLabel}</p>
              </div>
            ))}
          </div>
          {/* timeline lines for rides */}
          <div
            className="max-h-72 overflow-scroll flex flex-col gap-1 relative "
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
                  className="h-10 flex items-center"
                  id={`${ride.id}-timeline`}
                >
                  {/* Student name on the left */}
                  <div
                    className="h-full flex justify-end items-center pr-2"
                    style={{
                      left: `${leftOffset}px`,
                      minWidth: `${positionFromLeft}px`,
                      maxWidth: `${positionFromLeft}px`,
                    }}
                  >
                    <p className="text-sm font-medium truncate text-left">
                      {ride.rider.firstName} {ride.rider.lastName}
                    </p>
                  </div>

                  {/* Ride block with start time */}
                  <button
                    className={`h-full border cursor-pointer ${
                      ride.noShow
                        ? ' bg-neutral-200 border-neutral-300 text-neutral-700'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-100'
                    } rounded-md flex items-center px-2 overflow-hidden`}
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
                        className={`text-sm ${
                          ride.noShow ? 'text-neutral-800' : 'text-neutral-100'
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
            className="w-full h-full absolute flex top-0 left-0 pointer-events-none"
            style={{ left: leftOffset }}
          >
            {timeLabels.map((_timeLabel, idx) => (
              <div
                key={idx}
                className="h-full border-l border-neutral-300"
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
            className="w-1 h-full absolute top-0 pointer-events-none border-l-4 border-blue-600/50 border-dotted"
            style={{
              left:
                ((new Date().getTime() - baseTime.getTime()) / (60 * 1000)) *
                minuteWidth,
            }}
          ></div>
        </div>
      </div>

      {/* current time  */}
      <BoxButton
        className="absolute left-2 bottom-2 z-10"
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
    <div className="w-full h-full bg-neutral-100 flex flex-col">
      {/* header */}
      <div className="w-full flex justify-between items-center border-b border-neutral-300">
        {/* header-left */}
        <div className="flex h-min w-min py-2 px-4 gap-8 items-center">
          {/* page title */}
          <div className="h-full flex items-center justify-center">
            <h1 className="text-2xl text-neutral-700 text-nowrap">
              Scheduled Rides
            </h1>
          </div>
          {/* date changer button */}
          <TitlePill className="text-neutral-800 text-nowrap">
            <button className="hover:bg-neutral-200 rounded-full">
              <ChevronLeft></ChevronLeft>
            </button>

            <p>Today | April 23, 2025</p>
            <CalendarToday></CalendarToday>
            <button className="hover:bg-neutral-200 rounded-full">
              <ChevronRight></ChevronRight>
            </button>
          </TitlePill>
        </div>
        {/* header-right  */}
        <div className="flex h-min w-min py-2 px-4 gap-8 ">
          <TitlePill className="text-neutral-800 text-nowrap">
            {/* title pill text element */}
            <div className="w-min h-min gap-2 px-4 py-1.5 flex items-center">
              <p className="text-2xl">{renderedRides.length}</p>
              <p>Total Rides</p>
            </div>
            {/* title pill text element */}
            <div className="w-min h-min gap-2 px-4 py-1.5 flex items-center">
              <p className="text-2xl">{noShow.length}</p>
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
      <div className="w-full h-full flex flex-col p-4 gap-4">
        {/* table container */}
        <div className="w-full flex-1 bg-white rounded-lg border border-neutral-300 flex flex-col">
          <ScheduledTable
            rides={renderedRides}
            selected={selected}
            handleSelection={handleSelection}
            handleSortChange={(newSortMode) => {
              setSortMode(newSortMode);
            }}
          ></ScheduledTable>
        </div>
        <div className="w-full flex-1 bg-white rounded-lg border border-neutral-300 flex flex-col">
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
