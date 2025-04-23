import {
  CalendarToday,
  ChevronLeft,
  ChevronRight,
  ViewList,
} from '@mui/icons-material';
import React, { FC, HTMLAttributes } from 'react';

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

const PillButton: FC<HTMLAttributes<HTMLButtonElement>> = ({
  children,
  onClick,
}) => {
  return (
    <button
      className="w-min h-min text-nowrap flex gap-2 px-4 py-2 border border-[#8ec695] bg-[#e4ffea] rounded-full hover:bg-[#c5f3cf] hover:cursor-pointer"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const Scheduled: FC = () => {
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
            <div className="w-min h-min gap-2 px-4 py-1.5 flex">
              <p className="text-2xl">84</p>
              <p>Total Rides</p>
            </div>
            {/* title pill text element */}
            <div className="w-min h-min gap-2 px-4 py-1.5 flex">
              <p className="text-2xl">3</p>
              <p>Recorded No-Shows</p>
            </div>
            <PillButton>
              <p className="text-[#296831]">Export to Excel</p>
              <ViewList className="text-[#296831]"></ViewList>
            </PillButton>
          </TitlePill>
        </div>
      </div>
    </div>
  );
};

export default Scheduled;
