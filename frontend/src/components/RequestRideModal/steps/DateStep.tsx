import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import moment from 'moment';
import { Ride } from '../../../types';
import { RideModalType } from '../types';
import { Label, Input } from '../../FormElements/FormElements';
import { isTimeValid } from '../../../util/index';
import CustomRepeatingRides from '../CustomRepeatingRides';
import CustomDatePicker from '../CustomDatePicker';
import styles from '../requestridemodal.module.css';

type DateStepProps = {
  ride?: Ride;
  modalType: RideModalType;
  showRepeatingCheckbox: boolean;
  showRepeatingInfo: boolean;
  onClose?: () => void;
  onNext?: () => void;
  currentStep?: 'date' | 'pickup' | 'dropoff';
};

const DateStep: React.FC<DateStepProps> = ({
  ride,
  modalType,
  showRepeatingCheckbox,
  showRepeatingInfo,
  onClose,
  onNext,
  currentStep = 'date',
}) => {
  const {
    register,
    formState: { errors },
    watch,
    trigger,
    reset,
    setValue,
  } = useFormContext();

  const [custom, setCustom] = useState(false);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [showRepeatOptions, setShowRepeatOptions] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const watchRepeating = watch('recurring', false);
  const watchStartDate = watch('startDate');
  const watchWhenRepeat = watch('whenRepeat', 'no-repeat');
  const watchEndDate = watch('endDate');
  const shouldDisableStartDate = ride && ride.schedulingState !== 'unscheduled';

  // Check if form is valid for enabling "Save and Continue" button
  // Date is always required - must be a valid date string (not empty, not just whitespace)
  // If Custom is selected, at least one day must be selected
  const hasValidDate = Boolean(
    watchStartDate &&
      typeof watchStartDate === 'string' &&
      watchStartDate.trim() !== '' &&
      watchStartDate !== 'Invalid date'
  );

  const isCustom = watchWhenRepeat === 'custom';
  const hasValidRepeats = !isCustom || selectedDays.size > 0;

  const isFormValid = hasValidDate && hasValidRepeats;

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setDragStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (dragStartY === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - dragStartY;

    // If user drags down more than 60px, close the modal
    if (deltaY > 60) {
      onClose?.();
      setDragStartY(null);
    }
  };

  const handleTouchEnd = () => {
    setDragStartY(null);
  };

  return (
    <div className={styles.stepPage}>
      <div className={styles.topContent}>
        {/* Drag handle at the top (click to close on desktop, drag down on mobile) */}
        <div
          className={styles.dragHandle}
          onClick={onClose}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        <div className={styles.mobileHeaderFrame}>
          <div className={styles.mobileTitleLeft}>Request a Ride</div>
          <div className={styles.datePickerAnchor}>
            <CustomDatePicker
              value={watchStartDate || ''}
              onChange={(date) => setValue('startDate', date)}
              className={styles.optionButton}
            />
          </div>
          <button
            type="button"
            className={styles.optionButton}
            onClick={() => {
              setShowRepeatOptions(!showRepeatOptions);
            }}
          >
            <span>
              {watchWhenRepeat === 'no-repeat'
                ? 'No Repeat'
                : watchWhenRepeat === 'daily'
                ? 'Daily'
                : watchWhenRepeat === 'weekly'
                ? 'Weekly'
                : watchWhenRepeat === 'biweekly'
                ? 'Biweekly'
                : watchWhenRepeat === 'custom'
                ? 'Custom'
                : 'No Repeat'}
            </span>
            <span aria-hidden="true" className={styles.optionIcon}>
              {/* Chevron-right icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M8.29496 7.11508L12.875 11.7051L8.29496 16.2951L9.70496 17.7051L15.705 11.7051L9.70496 5.70508L8.29496 7.11508Z"
                  fill="black"
                />
              </svg>
            </span>
          </button>

          {/* Repeat options selection form */}
          {showRepeatOptions && (
            <div className={styles.repeatOptionsContainer}>
              {[
                { value: 'no-repeat', label: 'No Repeat' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'biweekly', label: 'Biweekly' },
                { value: 'custom', label: 'Custom' },
              ].map((option) => {
                const isSelected = watchWhenRepeat === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.repeatOption} ${
                      isSelected ? styles.repeatOptionSelected : ''
                    }`}
                    onClick={() => {
                      if (option.value === 'no-repeat') {
                        setValue('whenRepeat', 'no-repeat');
                        setValue('recurring', false);
                        setCustom(false);
                      } else if (option.value === 'custom') {
                        setValue('whenRepeat', 'custom');
                        setValue('recurring', true);
                        setCustom(true);
                      } else {
                        // Daily, Weekly, Biweekly - set recurring to true but don't show custom options
                        setValue('whenRepeat', option.value);
                        setValue('recurring', true);
                        setCustom(false);
                      }
                      setShowRepeatOptions(false);
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Custom repeat day selection - appears when Custom is selected */}
          {showRepeatingInfo && watchWhenRepeat === 'custom' && (
            <div className={styles.customRepeatSection}>
              <div className={styles.selectDaysLabel}>
                Select day of the week
              </div>
              <div className={styles.daysContainer}>
                {[
                  { value: 'Mon', label: 'M' },
                  { value: 'Tue', label: 'T' },
                  { value: 'Wed', label: 'W' },
                  { value: 'Thu', label: 'T' },
                  { value: 'Fri', label: 'F' },
                ].map((day) => {
                  const isSelected = selectedDays.has(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      className={`${styles.dayBlock} ${
                        isSelected ? styles.dayBlockSelected : ''
                      }`}
                      onClick={() => {
                        const newSelectedDays = new Set(selectedDays);
                        if (isSelected) {
                          newSelectedDays.delete(day.value);
                        } else {
                          newSelectedDays.add(day.value);
                        }
                        setSelectedDays(newSelectedDays);
                        // Update form values
                        setValue(day.value, !isSelected);
                      }}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden form fields for validation - Date button will trigger date picker */}
      <div
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: 0,
          height: 0,
          overflow: 'hidden',
        }}
      >
        <input
          id="startDate"
          type="date"
          disabled={shouldDisableStartDate}
          aria-hidden="true"
          {...register('startDate', {
            required: 'Please select a date',
            validate: (startDate) => {
              const notWeekend =
                moment(startDate).day() !== 0 && moment(startDate).day() !== 6;
              if (!notWeekend) {
                return 'Please enter a valid date. (Note: CULifts does not operate during weekends or university-wide breaks.)';
              }
              return (
                isTimeValid(startDate, '00:00') ||
                "Can't schedule rides for less than 2 days from today"
              );
            },
          })}
        />
        {/* Hidden checkbox for repeating - Repeats button will toggle this */}
        <input
          type="checkbox"
          id="recurring"
          aria-hidden="true"
          {...register('recurring')}
        />
        {/* Hidden input for whenRepeat */}
        <input type="hidden" {...register('whenRepeat')} />
      </div>
      {errors.startDate && (
        <p className={styles.error}>{errors.startDate.message as string}</p>
      )}

      {/* Bottom section with page indicators and buttons */}
      <div className={styles.bottomSection}>
        {/* Page indicators - positioned right above bottom button frame */}
        <div className={styles.pageIndicators}>
          <div
            className={`${styles.pageIndicator} ${
              currentStep === 'date' ? styles.pageIndicatorActive : ''
            }`}
          />
          <div
            className={`${styles.pageIndicator} ${
              currentStep === 'pickup' ? styles.pageIndicatorActive : ''
            }`}
          />
          <div
            className={`${styles.pageIndicator} ${
              currentStep === 'dropoff' ? styles.pageIndicatorActive : ''
            }`}
          />
        </div>

        {/* Bottom frame with Cancel and Save & Continue buttons */}
        <div className={styles.bottomButtonFrame}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => {
              reset();
              onClose?.();
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.saveContinueButton}
            disabled={!isFormValid}
            onClick={async () => {
              const fieldsToValidate = ['startDate'];
              const isValid = await trigger(fieldsToValidate as any);
              if (isValid && isFormValid && onNext) {
                onNext();
              }
            }}
          >
            Save and Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateStep;
