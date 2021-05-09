import React, {useState} from 'react';
import DatePicker from 'react-date-picker';
import cn from 'classnames';
import { YearPicker, MonthPicker} from 'react-dropdown-date';
import calendarIcon from './calendar.svg';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './datefilter.module.css';
import './datefilter_override.css';

const DateFilter = () => {
    const currDate = new Date(); 
    const [selectedYear, setSelectedYear] = useState(currDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(currDate.getMonth());
    const [startDate, setStartDate] = useState<Date | Date[]>(currDate);
    const [endDate, setEndDate] = useState<Date | Date[]>(currDate);

    const calendar = <img className={styles.calIcon} src={calendarIcon} alt='calendar'/>

    return(
        <div className = {styles.dateFilter}>
          <div className = {styles.box}>
            <label className = {styles.datePickerLabel} htmlFor = {'year'}>Year</label>
            <YearPicker
              required={true}             
              disabled={false}            
              value={selectedYear}             
              onChange={(year: number) => {       
                setSelectedYear(year);
                console.log(year);
              }}
              name={'year'}
              classes={cn(styles.dropdown, styles.yearDropdown)}
            />
          </div>
          <div className = {styles.box}>
            <label className = {styles.datePickerLabel} htmlFor = {'month'}>Month</label>
            <MonthPicker
            endYearGiven              // mandatory if end={} is given in YearPicker
            year={selectedYear}    // mandatory
            required={true}           // default is false
            disabled={false}           // default is false
            value={selectedMonth}  // mandatory
            onChange={(month: number) => {    // mandatory
              setSelectedMonth(month);
            }}
            id={'month'}
            name={'month'}
            classes={cn(styles.dropdown, styles.monthDropdown)}
            />
          </div>
          <div className={styles.box}>
            <label className = {styles.datePickerLabel}>Date Range</label>
            <div className={styles.dateRangeContainer}>
              <DatePicker
                className={styles.datePicker1}
                calendarClassName={styles.dateCalendar}
                calendarIcon={calendar}
                onChange={setStartDate}
                value={startDate}
              />
              <span>-</span>
              <DatePicker
                className={styles.datePicker2}
                calendarClassName={styles.dateCalendar}
                calendarIcon={calendar}
                onChange={setEndDate}
                value={endDate}
              />
            </div>
          </div>
      </div>
    ); 
};

export default DateFilter;
