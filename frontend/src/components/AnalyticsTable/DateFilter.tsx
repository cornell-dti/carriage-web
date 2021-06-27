import React from 'react';
import cn from 'classnames';
import moment from 'moment';
import styles from './datefilter.module.css';

type DateFilterProps = {
  startDate: string;
  endDate: string;
  onChange: (unit: 'startDate' | 'endDate', value: any) => void;
}

const DateFilter = ({ startDate, endDate, onChange }: DateFilterProps) => {
  return (
    <div className={styles.dateFilter}>
      <div className={styles.box}>
        <label className={styles.datePickerLabel}>Date Range</label>
        <div className={styles.dateRangeContainer}>
          <input
            className={styles.input}
            type="date"
            onChange={(e) => {
              const newStart = e.target.value;
              if (newStart > endDate) {
                onChange('endDate', newStart);
              }
              onChange('startDate', newStart);
            }}
            value={startDate}
          />
          <span style={{ margin: '0 1rem' }}>-</span>
          <input
            className={styles.input}
            type="date"
            onChange={(e) => {
              const newEnd = e.target.value;
              if (newEnd < startDate) {
                onChange('startDate', newEnd);
              }
              onChange('endDate', newEnd);
            }}
            value={endDate}
          />
        </div>
      </div>
    </div>
  );
};

export default DateFilter;
