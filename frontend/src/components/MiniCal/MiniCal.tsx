import React from 'react';
import DatePicker, { CalendarContainer } from 'react-datepicker';

import cn from 'classnames';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker.css';
import styles from './minical.module.css';

const isToday = (date: Date) => {
  return date.getDate() === new Date().getDate();
};

const isTomorrow = (date: Date) => {
  return date.getDate() === new Date().getDate() + 1;
};

const isWeekday = (date: Date) => {
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

type MiniCalProps = {
  cur_date: Date;
  callback: (cur: Date) => void;
};

const MiniCal = ({ cur_date, callback }: MiniCalProps) => {
  const CustomInput = ({ value, onClick }: any) => (
    <button className={styles.customInput} onClick={onClick}>
      {isToday(cur_date) ? 'Today' : ''}
      {isTomorrow(cur_date) ? 'Tomorrow' : ''} 📅 {value}
    </button>
  );

  const pseudoScroll = () => {
    const x = window.scrollX;
    const y = window.scrollY;
    window.scroll(x + 1, y);
    window.scroll(x, y);
  };

  return (
    <div className={styles.root}>
      USERPROFILE{'   '}
      <DatePicker
        adjustDateOnChange
        selected={cur_date}
        onChange={callback}
        closeOnScroll={true}
        dateFormat="MMM dd, yyyy"
        showPopperArrow={false}
        customInput={<CustomInput />}
        filterDate={isWeekday}
        highlightDates={[
          {
            'custom--today': [new Date()],
          },
        ]}
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div>
            <div className={styles.justify}>
              <button
                className={cn(styles.btn2, {
                  [styles.active]: isToday(date),
                })}
                onClick={() => {
                  callback(new Date());
                  pseudoScroll();
                }}
              >
                TODAY
              </button>
              <button
                className={cn(styles.btn2, {
                  [styles.active]: isTomorrow(date),
                })}
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(new Date().getDate() + 1);
                  callback(tomorrow);
                  pseudoScroll();
                }}
              >
                TOMORROW
              </button>
            </div>
            <div className={styles.justify}>
              <button
                className={styles.btn}
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
              >
                {'<'}
              </button>
              <span className={styles.month}>
                {`${date.toLocaleString('default', {
                  month: 'long',
                })} ${date.getFullYear()}`}
              </span>

              <button
                className={styles.btn}
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
              >
                {'>'}
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default MiniCal;
