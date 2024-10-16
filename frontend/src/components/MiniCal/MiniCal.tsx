import React, { useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import cn from 'classnames';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker_override.css';
import styles from './minical.module.css';
import { useDate } from '../../context/date';

/**startDate is inclusive, endDate is exclusive */
type Holiday = {
  startDate: Date;
  endDate: Date;
  holidayName: string;
};

const holidays: Holiday[] = [
  {
    startDate: new Date('2024-2-24'),
    endDate: new Date('2024-2-28'),
    holidayName: 'February Break',
  },
  {
    startDate: new Date('2024-3-30'),
    endDate: new Date('2024-4-8'),
    holidayName: 'Spring Break',
  },
];

const isHoliday = (date: Date) => {
  for (const holiday of holidays) {
    if (holiday.startDate <= date && date < holiday.endDate) {
      return true;
    }
  }
  return false;
};

const currentDate = new Date();
const isToday = (date: Date) =>
  date.getDate() === currentDate.getDate() &&
  date.getMonth() === currentDate.getMonth() &&
  date.getFullYear() === currentDate.getFullYear();

const isTomorrow = (date: Date) => {
  const tomorrow = new Date();
  tomorrow.setDate(currentDate.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
};

const Icon = () => (
  <svg
    className={styles.svg}
    viewBox="0 0 12 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* SVG path data */}
  </svg>
);

const MiniCal = () => {
  const { curDate, setCurDate } = useDate();
  const [isExpanded, setExpanded] = useState('Collapsed');
  const datePickerRef = useRef<any>(null);

  const updateDate = (d: Date | null) => {
    if (d) {
      if (datePickerRef.current) {
        datePickerRef.current.setPreSelection(d);
        datePickerRef.current.setMonth(d);
      }
      setCurDate(d);
    }
  };

  const updateExpanded = (s: string) => {
    setExpanded(s);
  };

  class CustomInput extends React.Component<any> {
    render() {
      return (
        <>
          <span aria-live="polite" className={styles.modal_state}>
            Modal is {isExpanded}
          </span>
          <button className={styles.customInput} onClick={this.props.onClick}>
            <span className={styles.primary}>
              {isToday(curDate) ? 'Today ' : ''}
              {isTomorrow(curDate) ? 'Tomorrow ' : ''}
            </span>
            <span className={styles.space} /> <Icon />
            <span className={styles.space} /> {this.props.value}
          </button>
        </>
      );
    }
  }

  const Indicators = ({ date }: { date: Date }) => (
    <svg
      width="50"
      height="14"
      viewBox="0 0 60 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="7" cy="7" r="7" fill={isToday(date) ? '#00C48C' : 'white'} />
      <circle
        cx="53"
        cy="7"
        r="7"
        fill={isTomorrow(date) ? '#00C48C' : 'white'}
      />
      <line x1="14" y1="7" x2="46" y2="7" stroke="white" />
    </svg>
  );

  const pseudoScroll = () => {
    const x = window.scrollX;
    const y = window.scrollY;
    window.scroll(x + 1, y);
    window.scroll(x, y);
  };

  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  const filterDate = (date: Date) => {
    return isWeekday(date) && !isHoliday(date);
  };

  return (
    <div className={styles.root}>
      <DatePicker
        adjustDateOnChange
        ref={datePickerRef}
        selected={curDate}
        shouldCloseOnSelect={false}
        onChange={updateDate}
        closeOnScroll={true}
        dateFormat="MMM dd, yyyy"
        showPopperArrow={false}
        onCalendarOpen={() => updateExpanded('Expanded')}
        onCalendarClose={() => updateExpanded('Collapsed')}
        customInput={<CustomInput />}
        filterDate={filterDate}
        openToDate={curDate}
        highlightDates={[{ 'custom--today': [new Date()] }]}
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div>
            <div className={styles.justify}>
              <button
                className={cn(styles.btn2, { [styles.active]: isToday(curDate) })}
                onClick={() => {
                  const today = new Date();
                  updateDate(today);
                  pseudoScroll();
                }}
              >
                TODAY
              </button>
              <Indicators date={curDate} />
              <button
                className={cn(styles.btn2, {
                  [styles.active]: isTomorrow(curDate),
                })}
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(currentDate.getDate() + 1);
                  updateDate(tomorrow);
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

