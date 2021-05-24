import React, { useState } from 'react';
import cn from 'classnames';
import moment from 'moment';
import styles from './datefilter.module.css';

const DateFilter = () => {
  const currDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currDate.getMonth());
  const [startDate, setStartDate] = useState(moment(currDate).format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment(currDate).format('YYYY-MM-DD'));

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
          defaultValue={selectedYear}
          onChange={(e) => {
            console.log(e.target.value);
          }}
        >
          {years.map((y, i) => <option key={y} value={i}>{y}</option>)}
        </select>
      </div>
      <div className={styles.box}>
        <label className={styles.datePickerLabel} htmlFor='month'>Month</label>
        <select
          id='month'
          name='month'
          className={styles.input}
          defaultValue={selectedMonth}
          onChange={(e) => {
            console.log(e.target.value);
          }}
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
              console.log(e.target.value);
            }}
            defaultValue={startDate}
          />
          <span style={{ margin: '0 1rem' }}>-</span>
          <input
            className={styles.input}
            type="date"
            onChange={(e) => {
              console.log(e.target.value);
            }}
            defaultValue={endDate}
          />
        </div>
      </div>
    </div>
  );
};

export default DateFilter;
