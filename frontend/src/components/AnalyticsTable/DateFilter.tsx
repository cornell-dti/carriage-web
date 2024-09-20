import React, { useState } from 'react';
import styles from './datefilter.module.css';
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
    <div className={styles.dateFilter}>
      <div className={styles.box}>
        <label className={styles.datePickerLabel}>Date Range</label>
        <div className={styles.dateRangeContainer}>
          <input
            aria-label="Start Date"
            className={styles.input}
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
          <span style={{ margin: '0 1rem' }}>-</span>
          <input
            aria-label="End Date"
            className={styles.input}
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
            className={styles.submitButton}
          >
            Apply Dates
          </Button>
        </div>
        <div className={styles.error}>{error}</div>
      </div>
    </div>
  );
};

export default DateFilter;
