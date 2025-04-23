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
import React, { FC, HTMLAttributes, useMemo } from 'react';
import { useRides } from '../../context/RidesContext';
import { Accessibility, Ride } from '../../types';
import moment from 'moment';
import PillButton, {
  ButtonAccent,
} from '../../components/PillButton/PillButton';

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
  if (!accessibilities || accessibilities.length === 0) return <p>None</p>;

  return (
    <div className="flex gap-1">
      {/* Use Set to remove duplicates (e.g., if multiple wheelchair-type needs) */}
      {[...new Set(accessibilities)].map((type, index) => (
        <AccessibilityIcon key={index} type={type} />
      ))}
    </div>
  );
};

interface ScheduledTableProps {
  rides: Ride[];
  selected: Ride | undefined;
  handleSelection: (selectionChange: Ride | undefined) => void;
}

const ScheduledTable: FC<ScheduledTableProps> = ({
  rides,
  selected,
  handleSelection,
}) => {
  return (
    <div className="flex flex-col w-full h-full items-center">
      {/* search and filter options */}
      <div className="flex w-full p-4 items-center justify-between border-b border-neutral-300">
        {/* filter left */}
        <div className="w-min h-min flex items-center gap-4 text-neutral-800">
          {/* filter */}
          <div className="w-min h-min flex text-nowrap gap-2">Sort By:</div>
        </div>
        {/* filter right */}
        <div className="w-min h-min flex items-center gap-4 text-neutral-800">
          {/* add ride */}
          <PillButton accent={ButtonAccent.PRIMARY}>
            <p>Add Ride</p>
            <AirportShuttle></AirportShuttle>
          </PillButton>
        </div>
      </div>
      {/* table header */}
      <div className="w-full h-min flex items-center justify-between text-neutral-500 p-3 border-b border-neutral-300">
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
          <div
            className={`w-full h-min flex items-center justify-between text-neutral-700 p-3 hover:${
              ride.noShow ? 'bg-neutral-100' : `bg-neutral-50`
            } cursor-pointer ${
              selected?.rider.id === ride.rider.id
                ? ride.noShow
                  ? 'bg-blue-400'
                  : 'bg-blue-200'
                : ride.noShow
                ? 'bg-neutral-200'
                : ''
            } `}
            key={idx}
            onClick={() => handleSelection(ride)}
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
          </div>
        ))}
      </div>
    </div>
  );
};

const Scheduled: FC = () => {
  const { scheduledRides, unscheduledRides } = useRides();

  const noShow = useMemo(() => {
    return scheduledRides.filter((ride) => ride.noShow);
  }, [scheduledRides]);

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
              <p className="text-2xl">{scheduledRides.length}</p>
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
            rides={scheduledRides}
            selected={undefined}
            handleSelection={() => {}}
          ></ScheduledTable>
        </div>
        {/* timeline container */}
        <div className="w-full flex-1 bg-white rounded-lg border border-neutral-300 flex flex-col"></div>
      </div>
    </div>
  );
};

export default Scheduled;
