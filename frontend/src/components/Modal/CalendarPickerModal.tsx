import React, { useState } from 'react';
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import {
  Calendar,
  DayValue,
  Day,
  utils,
} from 'react-modern-calendar-datepicker';
import styles from './calendarPickerModal.module.css';

const CalendarPickerModal = () => {
  const today = utils('en').getToday();
  const [selectedDay, setSelectedDay] = React.useState<DayValue>(null);

  const currentDate = new Date();
  const endDate = new Date(
    currentDate.getFullYear() + 5,
    currentDate.getMonth() + 1,
    currentDate.getDate()
  );

  const disabledDays: Day[] = [];

  while (currentDate < endDate) {
    if (currentDate.getDay() == 6 || currentDate.getDay() == 0) {
      disabledDays.push({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
        day: currentDate.getDate(),
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const handleDisabledSelect = (disabledDay: Day) => {
    console.log('Tried selecting a disabled day', disabledDay);
  };

  return (
    <Calendar
      value={selectedDay}
      minimumDate={today}
      onChange={setSelectedDay}
      disabledDays={disabledDays}
      onDisabledDayError={handleDisabledSelect}
      colorPrimary="#D5E9FA"
      calendarClassName={styles.calendar}
      shouldHighlightWeekends
    />
  );
};

export default CalendarPickerModal;
