import React, { useState } from 'react';
import { Button } from '../FormElements/FormElements';
import { format_date } from '../../util/index';

type DateFilterProps = {
  initStartDate: string;
  initEndDate: string;
  onSubmit: (startDate: string, endDate: string) => void;
};

/*
 The DateFilter component facilitates the selection of a valid date range through 
 two input fields for start and end dates. It dynamically updates error messages
 based on user input, ensuring that the chosen start date is before or on the end date. 
 The component utilizes React state to manage date inputs and provides accessibility 
 features for screen readers. The "Apply Dates" button triggers the onSubmit callback 
 only when there are no validation errors, passing the selected start and end dates 
 for further handling. 
*/

const DateFilter = ({
  initStartDate,
  initEndDate,
  onSubmit,
}: DateFilterProps) => {
  const [startDate, setStartDate] = useState(initStartDate);
  const [endDate, setEndDate] = useState(initEndDate);
  const [error, setError] = useState('');
  const today = format_date();

  return (
    <div className="flex flex-row flex-nowrap justify-start mb-4">
      <div className="flex flex-col m-0">
        <label className="font-semibold text-xl">Date Range</label>
        <div className="flex items-center flex-wrap">
          <input
            aria-label="Start Date"
            className="rounded-[10px] text-xl font-semibold p-2 px-4 border border-black"
            type="date"
            max={today}
            onChange={(e) => {
              const newStart = e.target.value;
              setStartDate(newStart);
              if (newStart > endDate) {
                setError('Start date must be before or on end date');
              } else {
                setError('');
              }
            }}
            value={startDate}
          />
          <span className="mx-4">-</span>
          <input
            aria-label="End Date"
            className="rounded-[10px] text-xl font-semibold p-2 px-4 border border-black"
            type="date"
            max={today}
            onChange={(e) => {
              const newEnd = e.target.value;
              setEndDate(newEnd);
              if (newEnd < startDate) {
                setError('End date must be after or on start date');
              } else {
                setError('');
              }
            }}
            value={endDate}
          />
          <Button
            onClick={() => {
              if (error === '') {
                onSubmit(startDate, endDate);
              }
            }}
            outline={true}
            className="bg-black text-white rounded-[10px] text-xl p-2 px-4 ml-4"
          >
            Apply Dates
          </Button>
        </div>
        <div className="text-[#eb0023] text-xs">{error}</div>
      </div>
    </div>
  );
};

export default DateFilter;
