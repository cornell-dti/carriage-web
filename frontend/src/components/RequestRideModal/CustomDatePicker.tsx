import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import styles from './requestridemodal.module.css';

type CustomDatePickerProps = {
    selectedDate: moment.Moment;
    currentMonth: moment.Moment;
    onMonthChange: (month: moment.Moment) => void;
    onDateSelect: (date: moment.Moment) => void;
    onCancel: () => void;
    buttonRef: React.RefObject<HTMLButtonElement>;
};

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
    selectedDate,
    currentMonth,
    onMonthChange,
    onDateSelect,
    onCancel,
    buttonRef,
}) => {
    const pickerRef = useRef<HTMLDivElement>(null);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                // onCancel will be called by parent
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const monthNames = moment.months();
    const currentYear = currentMonth.year();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

    const handlePreviousMonth = () => {
        onMonthChange(currentMonth.clone().subtract(1, 'month'));
    };

    const handleNextMonth = () => {
        onMonthChange(currentMonth.clone().add(1, 'month'));
    };

    const handlePreviousYear = () => {
        onMonthChange(currentMonth.clone().subtract(1, 'year'));
    };

    const handleNextYear = () => {
        onMonthChange(currentMonth.clone().add(1, 'year'));
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const monthIndex = parseInt(e.target.value);
        onMonthChange(currentMonth.clone().month(monthIndex));
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const year = parseInt(e.target.value);
        onMonthChange(currentMonth.clone().year(year));
    };

    // Get calendar days for the current month
    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const startDate = startOfMonth.clone().startOf('week');
    const endDate = endOfMonth.clone().endOf('week');
    const days: moment.Moment[] = [];
    let current = startDate.clone();
    while (current.isSameOrBefore(endDate, 'day')) {
        days.push(current.clone());
        current.add(1, 'day');
    }

    return (
        <div
            ref={pickerRef}
            className={styles.customDatePicker}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Top frame with month and year selectors */}
            <div className={styles.datePickerTopFrame}>
                {/* Month selector on left */}
                <div className={styles.monthYearSelector}>
                    <button
                        type="button"
                        className={styles.datePickerArrow}
                        onClick={handlePreviousMonth}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z"
                                fill="#49454F"
                            />
                        </svg>
                    </button>
                    <select
                        className={styles.monthYearSelect}
                        value={currentMonth.month()}
                        onChange={handleMonthChange}
                    >
                        {monthNames.map((month, index) => (
                            <option key={index} value={index}>
                                {month}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className={styles.datePickerArrow}
                        onClick={handleNextMonth}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59Z"
                                fill="#49454F"
                            />
                        </svg>
                    </button>
                </div>

                {/* Year selector on right */}
                <div className={styles.monthYearSelector}>
                    <button
                        type="button"
                        className={styles.datePickerArrow}
                        onClick={handlePreviousYear}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z"
                                fill="#49454F"
                            />
                        </svg>
                    </button>
                    <select
                        className={styles.monthYearSelect}
                        value={currentYear}
                        onChange={handleYearChange}
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className={styles.datePickerArrow}
                        onClick={handleNextYear}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59Z"
                                fill="#49454F"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Calendar grid */}
            <div className={styles.datePickerCalendar}>
                {/* Day headers */}
                <div className={styles.datePickerWeekdays}>
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <div key={day} className={styles.datePickerWeekday}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className={styles.datePickerDays}>
                    {days.map((day, index) => {
                        const isCurrentMonth = day.month() === currentMonth.month();
                        const isSelected = day.isSame(selectedDate, 'day');
                        const isToday = day.isSame(moment(), 'day');

                        return (
                            <button
                                key={index}
                                type="button"
                                className={`${styles.datePickerDay} ${
                                    !isCurrentMonth ? styles.datePickerDayOtherMonth : ''
                                } ${isSelected ? styles.datePickerDaySelected : ''} ${
                                    isToday ? styles.datePickerDayToday : ''
                                }`}
                                onClick={() => {
                                    if (isCurrentMonth) {
                                        onDateSelect(day);
                                    }
                                }}
                                disabled={!isCurrentMonth}
                            >
                                {day.date()}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bottom frame with Cancel and OK buttons */}
            <div className={styles.datePickerBottomFrame}>
                <button
                    type="button"
                    className={styles.datePickerCancelButton}
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className={styles.datePickerOkButton}
                    onClick={() => {
                        onDateSelect(selectedDate);
                    }}
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default CustomDatePicker;
