import React from 'react';
import DatePicker from 'react-datepicker';
import cn from 'classnames';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker_override.css';
import styles from './minical.module.css';
import { useDate } from '../../context/date';

const isToday = (date: Date) => {
  return date.getDate() === new Date().getDate();
};

const isTomorrow = (date: Date) => {
  return date.getDate() === new Date().getDate() + 1;
};

const MiniCal = () => {
  const { curDate, setCurDate } = useDate();

  const updateDate = (d: Date) => {
    setCurDate(d);
  };
  class CustomInput extends React.Component<any> {
    render() {
      return (
        <button className={styles.customInput} onClick={this.props.onClick}>
          {isToday(curDate) ? 'Today' : ''}
          {isTomorrow(curDate) ? 'Tomorrow' : ''} 📅 {this.props.value}
        </button>
      );
    }
  }

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
