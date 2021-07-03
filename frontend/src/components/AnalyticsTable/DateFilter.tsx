import React, { useState } from 'react';
import moment from 'moment';
import styles from './datefilter.module.css';
import { Button } from '../FormElements/FormElements';

type DateFilterProps = {
  initStartDate: string;
  initEndDate: string;
  onSubmit: (startDate: string, endDate: string) => void;
}

const DateFilter = ({ initStartDate, initEndDate, onSubmit }: DateFilterProps) => {
  const [startDate, setStartDate] = useState(initStartDate);
  const [endDate, setEndDate] = useState(initEndDate);
  const [error, setError] = useState('');
  const today = moment().format('YYYY-MM-DD');

  return (
    <div className={styles.dateFilter}>
      <div className={styles.box}>
        <label className={styles.datePickerLabel}>Date Range</label>
        <div className={styles.dateRangeContainer}>
          <input
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
          <Button onClick={() => {
            if (error === '') {
              onSubmit(startDate, endDate);
            }
          }} outline={true} className={styles.submitButton}>
            Apply Dates
          </Button>
        </div>
        <div className={styles.error}>{error}</div>
      </div>
    </div>
  );
};

export default DateFilter;
