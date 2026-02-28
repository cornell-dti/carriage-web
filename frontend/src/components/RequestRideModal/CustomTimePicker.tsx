import React, { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import styles from './requestridemodal.module.css';

type CustomTimePickerProps = {
    selectedTime: string; // Format: "HH:mm"
    onTimeSelect: (time: string) => void;
    onCancel: () => void;
    buttonRef: React.RefObject<HTMLButtonElement>;
};

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
    selectedTime,
    onTimeSelect,
    onCancel,
    buttonRef,
}) => {
    const pickerRef = useRef<HTMLDivElement>(null);
    const [selectedHour, setSelectedHour] = useState<number>(() => {
        if (selectedTime) {
            return parseInt(selectedTime.split(':')[0]) || 12;
        }
        return 12;
    });
    const [selectedMinute, setSelectedMinute] = useState<number>(() => {
        if (selectedTime) {
            return parseInt(selectedTime.split(':')[1]) || 0;
        }
        return 0;
    });
    const [isAM, setIsAM] = useState<boolean>(() => {
        if (selectedTime) {
            const hour = parseInt(selectedTime.split(':')[0]) || 12;
            return hour < 12;
        }
        return true;
    });

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

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const handleHourSelect = (hour: number) => {
        setSelectedHour(hour);
    };

    const handleMinuteSelect = (minute: number) => {
        setSelectedMinute(minute);
    };

    const handleAMPMToggle = (am: boolean) => {
        setIsAM(am);
    };

    const handleOK = () => {
        let hour24 = selectedHour;
        if (!isAM && selectedHour !== 12) {
            hour24 = selectedHour + 12;
        } else if (isAM && selectedHour === 12) {
            hour24 = 0;
        }
        const timeString = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
        onTimeSelect(timeString);
    };

    return (
        <div
            ref={pickerRef}
            className={styles.customTimePicker}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Time selection grid */}
            <div className={styles.timePickerContent}>
                {/* Hours */}
                <div className={styles.timePickerColumn}>
                    <div className={styles.timePickerLabel}>Hour</div>
                    <div className={styles.timePickerValues}>
                        {hours.map((hour) => (
                            <button
                                key={hour}
                                type="button"
                                className={`${styles.timePickerValue} ${
                                    selectedHour === hour
                                        ? styles.timePickerValueSelected
                                        : ''
                                }`}
                                onClick={() => handleHourSelect(hour)}
                            >
                                {hour}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Minutes */}
                <div className={styles.timePickerColumn}>
                    <div className={styles.timePickerLabel}>Minute</div>
                    <div className={styles.timePickerValues}>
                        {minutes.map((minute) => (
                            <button
                                key={minute}
                                type="button"
                                className={`${styles.timePickerValue} ${
                                    selectedMinute === minute
                                        ? styles.timePickerValueSelected
                                        : ''
                                }`}
                                onClick={() => handleMinuteSelect(minute)}
                            >
                                {minute.toString().padStart(2, '0')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* AM/PM */}
                <div className={styles.timePickerColumn}>
                    <div className={styles.timePickerLabel}>Period</div>
                    <div className={styles.timePickerValues}>
                        <button
                            type="button"
                            className={`${styles.timePickerValue} ${
                                isAM ? styles.timePickerValueSelected : ''
                            }`}
                            onClick={() => handleAMPMToggle(true)}
                        >
                            AM
                        </button>
                        <button
                            type="button"
                            className={`${styles.timePickerValue} ${
                                !isAM ? styles.timePickerValueSelected : ''
                            }`}
                            onClick={() => handleAMPMToggle(false)}
                        >
                            PM
                        </button>
                    </div>
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
                    onClick={handleOK}
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default CustomTimePicker;
