import React from 'react';
import cn from 'classnames';
import moment from 'moment';
import styles from './datefilter.module.css';

type DateFilterProps = {
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  onChange: (unit: 'year' | 'month' | 'startDate' | 'endDate', value: any) => void;
}

const DateFilter = ({ year, month, startDate, endDate, onChange }: DateFilterProps) => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const years = [];
  for (let i = 2020; i <= moment().year(); i += 1) {
    years.push(i);
  }

  return (
    <div className={styles.dateFilter}>
      <div className={styles.box}>
        <label className={styles.datePickerLabel} htmlFor='year'>Year</label>
        <select
          id="year"
          name='year'
          className={cn(styles.input, styles.yearDropdown)}
          value={year}
          onChange={(e) => onChange('year', Number(e.target.value))}
        >
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className={styles.box}>
        <label className={styles.datePickerLabel} htmlFor='month'>Month</label>
        <select
          id='month'
          name='month'
          className={styles.input}
          value={month}
          onChange={(e) => onChange('month', Number(e.target.value))}
        >
          {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>
      </div>
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
