import React, {useState} from 'react';
import DatePicker from 'react-datepicker';
import cn from 'classnames';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './datefilter.module.css';
import { YearPicker, MonthPicker} from 'react-dropdown-date';

const DateFilter = () => {
    const monthNames =  ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
    const currDate = new Date(); 
    const [selectedYear, setSelectedYear] = useState(currDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(currDate.getMonth());
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
      </div>
    ); 
};

export default DateFilter;