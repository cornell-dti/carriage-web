import React from 'react';
import DatePicker, { CalendarContainer } from 'react-datepicker';

import cn from 'classnames';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker.css';
import styles from './minical.module.css';

type MiniCalProps = {
  date: Date;
  cb: (cur: Date) => void;
};

const MiniCal = ({ date, cb }: MiniCalProps) => {
  const CustomInput = ({ value, onClick }: any) => (
    <button className={styles.customInput} onClick={onClick}>
      {date.getDate() == new Date().getDate() ? 'Today' : ''}
      {date.getDate() == new Date().getDate() + 1 ? 'Tomorrow' : ''} 📅 {value}
    </button>
  );

  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

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
        selected={date}
        onChange={cb}
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
            <div className={styles.just}>
              <button
                className={cn(styles.b, {
                  [styles.act]: date.getDate() == new Date().getDate(),
                })}
                onClick={() => {
                  cb(new Date());
                  pseudoScroll();
                }}
              >
                TODAY
              </button>
              <button
                className={cn(styles.b, {
                  [styles.act]: date.getDate() == new Date().getDate() + 1,
                })}
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(new Date().getDate() + 1);
                  cb(tomorrow);
                  pseudoScroll();
                }}
              >
                TOMORROW
              </button>
            </div>
            <div className={styles.just}>
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
