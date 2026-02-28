import React, { useState, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import moment from 'moment';
import { useLocations } from '../../../context/LocationsContext';
import CustomDatePicker from '../CustomDatePicker';
import { Location } from '../../../types';
import styles from '../requestridemodal.module.css';

type RequestSummaryStepProps = {
  onClose?: () => void;
  onNext?: () => void;
  onBack?: () => void;
};

const REPEAT_LABELS: Record<string, string> = {
  'no-repeat': 'No Repeat',
  'daily': 'Daily',
  'weekly': 'Weekly',
  'biweekly': 'Biweekly',
  'custom': 'Custom',
};

const REPEAT_OPTIONS = [
  { value: 'no-repeat', label: 'No Repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'custom', label: 'Custom' },
];

type CustomDayValue = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';

const CUSTOM_DAYS: { value: CustomDayValue; label: string }[] = [
  { value: 'Mon', label: 'M' },
  { value: 'Tue', label: 'T' },
  { value: 'Wed', label: 'W' },
  { value: 'Thu', label: 'T' },
  { value: 'Fri', label: 'F' },
];

type EditingSection = 'date' | 'pickup' | 'dropoff' | null;

const RequestSummaryStep: React.FC<RequestSummaryStepProps> = ({
  onClose,
  onNext,
  onBack,
}) => {
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMonth, setDatePickerMonth] = useState(moment());
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);
  const [pickupTimeHour, setPickupTimeHour] = useState<string>('');
  const [pickupTimeMinute, setPickupTimeMinute] = useState<string>('');
  const [pickupTimePeriod, setPickupTimePeriod] = useState<'AM' | 'PM'>('AM');
  const [dropoffTimeHour, setDropoffTimeHour] = useState<string>('');
  const [dropoffTimeMinute, setDropoffTimeMinute] = useState<string>('');
  const [dropoffTimePeriod, setDropoffTimePeriod] = useState<'AM' | 'PM'>('AM');

  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const pickupDropdownRef = useRef<HTMLDivElement>(null);
  const dropoffDropdownRef = useRef<HTMLDivElement>(null);

  const { watch, setValue } = useFormContext();
  const { locations } = useLocations();

  const startDate = watch('startDate');
  const whenRepeat = watch('whenRepeat') || 'no-repeat';
  const mon = watch('Mon');
  const tue = watch('Tue');
  const wed = watch('Wed');
  const thu = watch('Thu');
  const fri = watch('Fri');
  const startLocation = watch('startLocation');
  const pickupTime = watch('pickupTime');
  const endLocation = watch('endLocation');
  const dropoffTime = watch('dropoffTime');

  const customDaysSelected: Record<string, boolean> = {
    Mon: !!mon,
    Tue: !!tue,
    Wed: !!wed,
    Thu: !!thu,
    Fri: !!fri,
  };
  const selectedDaysSet = new Set(
    (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const).filter((d) => customDaysSelected[d])
  );

  // Sync pickup time state when entering pickup edit mode
  useEffect(() => {
    if (editingSection === 'pickup' && pickupTime) {
      const t = moment(pickupTime, 'HH:mm');
      setPickupTimeHour(t.format('h'));
      setPickupTimeMinute(t.format('mm'));
      setPickupTimePeriod(t.format('A') as 'AM' | 'PM');
    }
  }, [editingSection, pickupTime]);

  // Sync dropoff time state when entering dropoff edit mode
  useEffect(() => {
    if (editingSection === 'dropoff' && dropoffTime) {
      const t = moment(dropoffTime, 'HH:mm');
      setDropoffTimeHour(t.format('h'));
      setDropoffTimeMinute(t.format('mm'));
      setDropoffTimePeriod(t.format('A') as 'AM' | 'PM');
    }
  }, [editingSection, dropoffTime]);

  // Write pickup time back to form
  useEffect(() => {
    if (editingSection === 'pickup' && pickupTimeHour && pickupTimeMinute) {
      const hour24 =
        pickupTimePeriod === 'AM'
          ? pickupTimeHour === '12'
            ? 0
            : parseInt(pickupTimeHour, 10)
          : pickupTimeHour === '12'
            ? 12
            : parseInt(pickupTimeHour, 10) + 12;
      const timeString = `${hour24.toString().padStart(2, '0')}:${pickupTimeMinute.padStart(2, '0')}`;
      setValue('pickupTime', timeString);
    }
  }, [editingSection, pickupTimeHour, pickupTimeMinute, pickupTimePeriod, setValue]);

  // Write dropoff time back to form
  useEffect(() => {
    if (editingSection === 'dropoff' && dropoffTimeHour && dropoffTimeMinute) {
      const hour24 =
        dropoffTimePeriod === 'AM'
          ? dropoffTimeHour === '12'
            ? 0
            : parseInt(dropoffTimeHour, 10)
          : dropoffTimeHour === '12'
            ? 12
            : parseInt(dropoffTimeHour, 10) + 12;
      const timeString = `${hour24.toString().padStart(2, '0')}:${dropoffTimeMinute.padStart(2, '0')}`;
      setValue('dropoffTime', timeString);
    }
  }, [editingSection, dropoffTimeHour, dropoffTimeMinute, dropoffTimePeriod, setValue]);

  const getPickupLocationDisplay = () => {
    if (!startLocation || startLocation === '') return '';
    if (startLocation === 'Other') return 'Other (Custom Address)';
    const loc = locations.find((l) => l.id === startLocation);
    return loc ? loc.name : startLocation;
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    return moment(time, 'HH:mm').format('h:mm A');
  };

  const getDropoffLocationDisplay = () => {
    if (!endLocation || endLocation === '') return '';
    if (endLocation === 'Other') return 'Other (Custom Address)';
    const loc = locations.find((l) => l.id === endLocation);
    return loc ? loc.name : endLocation;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY !== null) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - dragStartY;
      if (diff > 100 && onClose) {
        onClose();
        setDragStartY(null);
      }
    }
  };

  const handleTouchEnd = () => {
    setDragStartY(null);
  };

  const toggleCustomDay = (day: CustomDayValue) => {
    const current = watch(day);
    setValue(day, !current);
  };

  const dateDisplay =
    startDate && moment(startDate).isValid()
      ? moment(startDate).format('MM/DD/YYYY')
      : '';

  const repeatDisplay =
    REPEAT_LABELS[whenRepeat] ??
    (whenRepeat ? whenRepeat.charAt(0).toUpperCase() + whenRepeat.slice(1) : 'No Repeat');

  return (
    <div className={styles.summaryStepPage}>
      <div
        className={styles.dragHandle}
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      <h2 className={styles.summaryTitle}>Request Summary</h2>

      <div className={styles.summaryScrollContainer}>
        {/* Date and time section */}
        <div className={styles.summaryDateTimeBlock}>
          <h3 className={styles.summaryDateTimeTitle}>Date and time</h3>

          {editingSection === 'date' ? (
            <div className={styles.summaryInlineEdit}>
              <div className={styles.datePickerAnchor}>
                <button
                  ref={dateButtonRef}
                  type="button"
                  className={styles.optionButton}
                  onClick={() => setShowDatePicker(!showDatePicker)}
                >
                  <span>
                    {startDate && moment(startDate).isValid()
                      ? moment(startDate).format('MM/DD/YYYY')
                      : 'Select date'}
                  </span>
                  <span className={styles.optionIcon} aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M19 19H5V8H19M16 1V3H8V1H6V3H5C3.89 3 3 3.89 3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V5C21 3.89 20.1 3 19 3H18V1" fill="black" />
                    </svg>
                  </span>
                </button>
                {showDatePicker && dateButtonRef.current && (
                  <CustomDatePicker
                    selectedDate={
                      startDate && moment(startDate).isValid() ? moment(startDate) : moment()
                    }
                    currentMonth={datePickerMonth}
                    onMonthChange={setDatePickerMonth}
                    onDateSelect={(date) => {
                      setValue('startDate', date.format('YYYY-MM-DD'));
                      setShowDatePicker(false);
                    }}
                    onCancel={() => setShowDatePicker(false)}
                    buttonRef={dateButtonRef}
                  />
                )}
              </div>
              <div className={styles.summaryRepeatBlock}>
                <div className={styles.repeatOptionsContainer}>
                  {REPEAT_OPTIONS.map((option) => {
                    const isSelected = whenRepeat === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`${styles.repeatOption} ${isSelected ? styles.repeatOptionSelected : ''}`}
                        onClick={() => {
                          if (option.value === 'no-repeat') {
                            setValue('whenRepeat', 'no-repeat');
                            setValue('recurring', false);
                          } else if (option.value === 'custom') {
                            setValue('whenRepeat', 'custom');
                            setValue('recurring', true);
                          } else {
                            setValue('whenRepeat', option.value);
                            setValue('recurring', true);
                          }
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                {whenRepeat === 'custom' && (
                  <div className={styles.customRepeatSection}>
                    <div className={styles.selectDaysLabel}>Select day of the week</div>
                    <div className={styles.daysContainer}>
                      {CUSTOM_DAYS.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          className={`${styles.dayBlock} ${selectedDaysSet.has(day.value) ? styles.dayBlockSelected : ''}`}
                          onClick={() => toggleCustomDay(day.value)}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                className={styles.summaryDoneButton}
                onClick={() => setEditingSection(null)}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className={styles.summaryValueBox}>
                <span>{dateDisplay}</span>
              </div>
              <div className={styles.summaryRepeatBlock}>
                <div className={styles.summaryValueBox}>
                  <span>{repeatDisplay}</span>
                </div>
                {whenRepeat === 'custom' && (
                  <div className={`${styles.daysContainer} ${styles.summaryCustomDaysInSummary}`}>
                    {CUSTOM_DAYS.map((day) => (
                      <div
                        key={day.value}
                        className={`${styles.summaryDayBlockReadOnly} ${customDaysSelected[day.value] ? styles.summaryDayBlockReadOnlySelected : ''}`}
                      >
                        {day.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                className={styles.summaryEditContainer}
                onClick={() => setEditingSection('date')}
              >
                <span className={styles.summaryEditText}>Edit</span>
              </button>
            </>
          )}
        </div>

        <div className={styles.summaryDivider} />

        {/* Pickup section */}
        <div className={styles.summarySectionBlock}>
          <h3 className={styles.summarySectionLabel}>Pickup Location</h3>
          {editingSection === 'pickup' ? (
            <div className={styles.summaryInlineEdit}>
              <div className={styles.searchInputWrapper} ref={pickupDropdownRef}>
                <button
                  type="button"
                  className={styles.locationSelectButton}
                  onClick={() => setShowPickupDropdown(!showPickupDropdown)}
                >
                  <span className={!startLocation ? styles.locationButtonPlaceholder : ''}>
                    {getPickupLocationDisplay() || 'Select pickup location'}
                  </span>
                  <span className={styles.optionIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transform: 'rotate(90deg)' }}>
                      <path d="M9.20508 3C10.929 3 12.5823 3.68482 13.8013 4.90381C15.0203 6.12279 15.7051 7.77609 15.7051 9.5C15.7051 11.11 15.1151 12.59 14.1451 13.73L14.4151 14H15.2051L20.2051 19L18.7051 20.5L13.7051 15.5V14.71L13.4351 14.44C12.2951 15.41 10.8151 16 9.20508 16C7.48117 16 5.82787 15.3152 4.60888 14.0962C3.3899 12.8772 2.70508 11.2239 2.70508 9.5C2.70508 7.77609 3.3899 6.12279 4.60888 4.90381C5.82787 3.68482 7.48117 3 9.20508 3ZM9.20508 5C6.70508 5 4.70508 7 4.70508 9.5C4.70508 12 6.70508 14 9.20508 14C11.7051 14 13.7051 12 13.7051 9.5C13.7051 7 11.7051 5 9.20508 5Z" fill="black" />
                    </svg>
                  </span>
                </button>
                {showPickupDropdown && (
                  <div className={styles.locationDropdown}>
                    {locations.map((location: Location) => (
                      <div
                        key={location.id}
                        className={styles.locationOption}
                        onClick={() => {
                          setValue('startLocation', location.id);
                          setShowPickupDropdown(false);
                        }}
                      >
                        {location.name}
                      </div>
                    ))}
                    <div
                      className={styles.locationOption}
                      onClick={() => {
                        setValue('startLocation', 'Other');
                        setShowPickupDropdown(false);
                      }}
                    >
                      Other (Custom Address)
                    </div>
                  </div>
                )}
              </div>
              <h3 className={`${styles.summarySectionLabel} ${styles.summarySectionLabelAfterValue}`}>Pickup Time</h3>
              <div className={styles.timeInputContainer}>
                <input
                  type="text"
                  className={styles.timeInputHour}
                  placeholder="12"
                  value={pickupTimeHour}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '');
                    if (v === '' || (parseInt(v, 10) >= 1 && parseInt(v, 10) <= 12)) setPickupTimeHour(v);
                  }}
                  maxLength={2}
                />
                <span className={styles.timeSeparator}>:</span>
                <input
                  type="text"
                  className={styles.timeInputMinute}
                  placeholder="00"
                  value={pickupTimeMinute}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '');
                    if (v === '' || (parseInt(v, 10) >= 0 && parseInt(v, 10) <= 59)) setPickupTimeMinute(v.slice(0, 2));
                  }}
                  onBlur={() => {
                    if (pickupTimeMinute && pickupTimeMinute.length === 1) setPickupTimeMinute(pickupTimeMinute.padStart(2, '0'));
                  }}
                  maxLength={2}
                />
                <div className={styles.timePeriodContainer}>
                  <button
                    type="button"
                    className={`${styles.timePeriodButton} ${pickupTimePeriod === 'AM' ? styles.timePeriodButtonActive : ''}`}
                    onClick={() => setPickupTimePeriod('AM')}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    className={`${styles.timePeriodButton} ${pickupTimePeriod === 'PM' ? styles.timePeriodButtonActive : ''}`}
                    onClick={() => setPickupTimePeriod('PM')}
                  >
                    PM
                  </button>
                </div>
              </div>
              <button
                type="button"
                className={styles.summaryDoneButton}
                onClick={() => setEditingSection(null)}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className={styles.summaryValueBox}>
                <span>{getPickupLocationDisplay()}</span>
              </div>
              <h3 className={`${styles.summarySectionLabel} ${styles.summarySectionLabelAfterValue}`}>Pickup Time</h3>
              <div className={styles.summaryValueBox}>
                <span>{formatTime(pickupTime)}</span>
              </div>
              <button
                type="button"
                className={styles.summaryEditContainer}
                onClick={() => setEditingSection('pickup')}
              >
                <span className={styles.summaryEditText}>Edit</span>
              </button>
            </>
          )}
        </div>

        <div className={`${styles.summaryDivider} ${styles.summaryDividerAfterSection}`} />

        {/* Dropoff section */}
        <div className={styles.summarySectionBlock}>
          <h3 className={styles.summarySectionLabel}>Dropoff Location</h3>
          {editingSection === 'dropoff' ? (
            <div className={styles.summaryInlineEdit}>
              <div className={styles.searchInputWrapper} ref={dropoffDropdownRef}>
                <button
                  type="button"
                  className={styles.locationSelectButton}
                  onClick={() => setShowDropoffDropdown(!showDropoffDropdown)}
                >
                  <span className={!endLocation ? styles.locationButtonPlaceholder : ''}>
                    {getDropoffLocationDisplay() || 'Select dropoff location'}
                  </span>
                  <span className={styles.optionIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transform: 'rotate(90deg)' }}>
                      <path d="M9.20508 3C10.929 3 12.5823 3.68482 13.8013 4.90381C15.0203 6.12279 15.7051 7.77609 15.7051 9.5C15.7051 11.11 15.1151 12.59 14.1451 13.73L14.4151 14H15.2051L20.2051 19L18.7051 20.5L13.7051 15.5V14.71L13.4351 14.44C12.2951 15.41 10.8151 16 9.20508 16C7.48117 16 5.82787 15.3152 4.60888 14.0962C3.3899 12.8772 2.70508 11.2239 2.70508 9.5C2.70508 7.77609 3.3899 6.12279 4.60888 4.90381C5.82787 3.68482 7.48117 3 9.20508 3ZM9.20508 5C6.70508 5 4.70508 7 4.70508 9.5C4.70508 12 6.70508 14 9.20508 14C11.7051 14 13.7051 12 13.7051 9.5C13.7051 7 11.7051 5 9.20508 5Z" fill="black" />
                    </svg>
                  </span>
                </button>
                {showDropoffDropdown && (
                  <div className={styles.locationDropdown}>
                    {locations.map((location: Location) => (
                      <div
                        key={location.id}
                        className={styles.locationOption}
                        onClick={() => {
                          setValue('endLocation', location.id);
                          setShowDropoffDropdown(false);
                        }}
                      >
                        {location.name}
                      </div>
                    ))}
                    <div
                      className={styles.locationOption}
                      onClick={() => {
                        setValue('endLocation', 'Other');
                        setShowDropoffDropdown(false);
                      }}
                    >
                      Other (Custom Address)
                    </div>
                  </div>
                )}
              </div>
              <h3 className={`${styles.summarySectionLabel} ${styles.summarySectionLabelAfterValue}`}>Dropoff Time</h3>
              <div className={styles.timeInputContainer}>
                <input
                  type="text"
                  className={styles.timeInputHour}
                  placeholder="12"
                  value={dropoffTimeHour}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '');
                    if (v === '' || (parseInt(v, 10) >= 1 && parseInt(v, 10) <= 12)) setDropoffTimeHour(v);
                  }}
                  maxLength={2}
                />
                <span className={styles.timeSeparator}>:</span>
                <input
                  type="text"
                  className={styles.timeInputMinute}
                  placeholder="00"
                  value={dropoffTimeMinute}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '');
                    if (v === '' || (parseInt(v, 10) >= 0 && parseInt(v, 10) <= 59)) setDropoffTimeMinute(v.slice(0, 2));
                  }}
                  onBlur={() => {
                    if (dropoffTimeMinute && dropoffTimeMinute.length === 1) setDropoffTimeMinute(dropoffTimeMinute.padStart(2, '0'));
                  }}
                  maxLength={2}
                />
                <div className={styles.timePeriodContainer}>
                  <button
                    type="button"
                    className={`${styles.timePeriodButton} ${dropoffTimePeriod === 'AM' ? styles.timePeriodButtonActive : ''}`}
                    onClick={() => setDropoffTimePeriod('AM')}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    className={`${styles.timePeriodButton} ${dropoffTimePeriod === 'PM' ? styles.timePeriodButtonActive : ''}`}
                    onClick={() => setDropoffTimePeriod('PM')}
                  >
                    PM
                  </button>
                </div>
              </div>
              <button
                type="button"
                className={styles.summaryDoneButton}
                onClick={() => setEditingSection(null)}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className={styles.summaryValueBox}>
                <span>{getDropoffLocationDisplay()}</span>
              </div>
              <h3 className={`${styles.summarySectionLabel} ${styles.summarySectionLabelAfterValue}`}>Dropoff Time</h3>
              <div className={styles.summaryValueBox}>
                <span>{formatTime(dropoffTime)}</span>
              </div>
              <button
                type="button"
                className={styles.summaryEditContainer}
                onClick={() => setEditingSection('dropoff')}
              >
                <span className={styles.summaryEditText}>Edit</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.bottomButtonFrame}>
          <button type="button" className={styles.cancelButton} onClick={onBack}>
            Back
          </button>
          <button type="button" className={styles.saveContinueButton} onClick={onNext}>
            Save and Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestSummaryStep;
