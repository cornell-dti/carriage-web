import React from 'react';
import DatePicker from 'react-datepicker';
import cn from 'classnames';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker_override.css';
import styles from './minical.module.css';
import { useDate } from '../../context/date';

const isToday = (date: Date) => date.getDate() === new Date().getDate();

const isTomorrow = (date: Date) => date.getDate() === new Date().getDate() + 1;

const Icon = () => (
  <svg
    className={styles.svg}
    viewBox="0 0 12 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 0.828613C3 0.729157 2.96049 0.633774 2.89016 0.563448C2.81984 0.493122 2.72446 0.453613 2.625 0.453613C2.52554 0.453613 2.43016 0.493122 2.35984 0.563448C2.28951 0.633774 2.25 0.729157 2.25 0.828613V1.20361H1.5C1.10218 1.20361 0.720644 1.36165 0.43934 1.64295C0.158035 1.92426 0 2.30579 0 2.70361L0 3.45361H12V2.70361C12 2.30579 11.842 1.92426 11.5607 1.64295C11.2794 1.36165 10.8978 1.20361 10.5 1.20361H9.75V0.828613C9.75 0.729157 9.71049 0.633774 9.64017 0.563448C9.56984 0.493122 9.47446 0.453613 9.375 0.453613C9.27554 0.453613 9.18016 0.493122 9.10983 0.563448C9.03951 0.633774 9 0.729157 9 0.828613V1.20361H3V0.828613ZM0 4.20361H12V10.9536C12 11.3514 11.842 11.733 11.5607 12.0143C11.2794 12.2956 10.8978 12.4536 10.5 12.4536H1.5C1.10218 12.4536 0.720644 12.2956 0.43934 12.0143C0.158035 11.733 0 11.3514 0 10.9536V4.20361ZM7.125 5.70361C7.02554 5.70361 6.93016 5.74312 6.85983 5.81345C6.78951 5.88377 6.75 5.97916 6.75 6.07861V6.82861C6.75 6.92807 6.78951 7.02345 6.85983 7.09378C6.93016 7.1641 7.02554 7.20361 7.125 7.20361H7.875C7.97446 7.20361 8.06984 7.1641 8.14017 7.09378C8.21049 7.02345 8.25 6.92807 8.25 6.82861V6.07861C8.25 5.97916 8.21049 5.88377 8.14017 5.81345C8.06984 5.74312 7.97446 5.70361 7.875 5.70361H7.125ZM9.375 5.70361C9.27554 5.70361 9.18016 5.74312 9.10983 5.81345C9.03951 5.88377 9 5.97916 9 6.07861V6.82861C9 6.92807 9.03951 7.02345 9.10983 7.09378C9.18016 7.1641 9.27554 7.20361 9.375 7.20361H10.125C10.2245 7.20361 10.3198 7.1641 10.3902 7.09378C10.4605 7.02345 10.5 6.92807 10.5 6.82861V6.07861C10.5 5.97916 10.4605 5.88377 10.3902 5.81345C10.3198 5.74312 10.2245 5.70361 10.125 5.70361H9.375ZM1.5 8.32861C1.5 8.22916 1.53951 8.13377 1.60984 8.06345C1.68016 7.99312 1.77554 7.95361 1.875 7.95361H2.625C2.72446 7.95361 2.81984 7.99312 2.89016 8.06345C2.96049 8.13377 3 8.22916 3 8.32861V9.07861C3 9.17807 2.96049 9.27345 2.89016 9.34378C2.81984 9.4141 2.72446 9.45361 2.625 9.45361H1.875C1.77554 9.45361 1.68016 9.4141 1.60984 9.34378C1.53951 9.27345 1.5 9.17807 1.5 9.07861V8.32861ZM4.125 7.95361C4.02554 7.95361 3.93016 7.99312 3.85984 8.06345C3.78951 8.13377 3.75 8.22916 3.75 8.32861V9.07861C3.75 9.17807 3.78951 9.27345 3.85984 9.34378C3.93016 9.4141 4.02554 9.45361 4.125 9.45361H4.875C4.97446 9.45361 5.06984 9.4141 5.14016 9.34378C5.21049 9.27345 5.25 9.17807 5.25 9.07861V8.32861C5.25 8.22916 5.21049 8.13377 5.14016 8.06345C5.06984 7.99312 4.97446 7.95361 4.875 7.95361H4.125Z"
      fill="white"
    />
  </svg>
);

const MiniCal = () => {
  const { curDate, setCurDate } = useDate();

  const updateDate = (d: Date) => {
    setCurDate(d);
  };
  class CustomInput extends React.Component<any> {
    render() {
      return (
        <button className={styles.customInput} onClick={this.props.onClick}>
          <span className={styles.primary}>
            {isToday(curDate) ? 'Today ' : ' '}
            {isTomorrow(curDate) ? 'Tomorrow ' : ' '}
          </span>
          <span className={styles.space} /> <Icon />
          <span className={styles.space} /> {this.props.value}
        </button>
      );
    }
  }

  const Indicators = ({ date }: { date: Date }) => (
    <div>
      <svg width="60" height="14" viewBox="0 0 60 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="7" r="7" fill={isToday(date) ? '#00C48C' : 'white'} />
        <circle cx="53" cy="7" r="7" fill={isTomorrow(date) ? '#00C48C' : 'white'} />
        <line x1="14" y1="7" x2="46" y2="7" stroke="white" />
      </svg>
    </div>
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
        selected={curDate}
        onChange={updateDate}
        closeOnScroll={true}
        dateFormat="MMM dd, yyyy"
        showPopperArrow={false}
        customInput={<CustomInput />}
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
                  updateDate(new Date());
                  pseudoScroll();
                }}
              >
                TODAY
              </button>
              <Indicators date={date} />
              <button
                className={cn(styles.btn2, {
                  [styles.active]: isTomorrow(date),
                })}
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(new Date().getDate() + 1);
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
