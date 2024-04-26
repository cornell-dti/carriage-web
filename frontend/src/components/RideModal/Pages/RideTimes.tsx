import React, { useEffect, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import cn from 'classnames';
import moment from 'moment';
import { ModalPageProps } from '../../Modal/types';
import { Button, Input, Label } from '../../FormElements/FormElements';
import styles from '../ridemodal.module.css';
import { useDate } from '../../../context/date';
import { format_date, checkBounds } from '../../../util/index';
import { ObjectType, RepeatValues } from '../../../types';
import calendarIcon from '../../../icons/userInfo/calendar.svg';
import clockIcon from '../../../icons/userInfo/clock.svg';
import trashIcon from '../../../icons/other/trash.svg';

// VERY TEMPORARY IMPLEMENTATION
// We use this "day selector" component a few times throughout the codebase,
// each with their own unique implementation. Making a reusable component for
// this is essential and needed, but would require a lot of refactoring.
// So for now this will do, but should be replaced ASAP.
const DaySelector = () => {
  const [selected, setSelected] = useState<ObjectType>({});
  const { register, getValues, formState } = useFormContext();
  const { errors } = formState;
  const dayLabels = {
    Mon: 'M',
    Tue: 'T',
    Wed: 'W',
    Thu: 'T',
    Fri: 'F',
  };

  const isSelected = (day: string) => selected[day] !== undefined;

  const validate = () =>
    Boolean(
      selected.Mon ||
        selected.Tue ||
        selected.Wed ||
        selected.Thu ||
        selected.Fri
    );

  const toggle = (day: string) => {
    setSelected((prev) => {
      if (isSelected(day)) {
        return { ...prev, [day]: undefined };
      }
      return { ...prev, [day]: 1 };
    });
  };

  useEffect(() => {
    Object.keys(dayLabels).forEach((day) => {
      const savedValue = getValues(`days.${day}`);
      if (savedValue === '1') {
        toggle(day);
      }
    });
  }, []);

  return (
    <>
      {Object.entries(dayLabels).map(([day, label]) => (
        <button
          key={day}
          name={`days.${day}`}
          value={isSelected(day) ? 1 : undefined}
          type="button"
          className={cn(styles.day, {
            [styles.daySelected]: isSelected(day),
          })}
          onClick={() => toggle(day)}
          ref={register({ validate })}
        >
          {label}
        </button>
      ))}
      {errors.days?.Mon?.type === 'validate' && (
        <p className={styles.error}>Please select a day</p>
      )}
    </>
  );
};

type RepeatSectionProps = {
  repeatValue: RepeatValues;
};

const RepeatSection = ({ repeatValue }: RepeatSectionProps) => {
  const { register, getValues, formState } = useFormContext();
  const { errors } = formState;
  return (
    <>
      {repeatValue === RepeatValues.Custom && (
        <div className={styles.colSpan}>
          <Label htmlFor="repeatsOn">Repeats on:</Label>
          <DaySelector />
        </div>
      )}
      <div className={styles.colSpan}>
        <Label htmlFor="endDate">End date:</Label>
        <Input
          id="endDate"
          type="date"
          name="endDate"
          aria-required="true"
          ref={register({
            required: true,
            validate: (endDate) => {
              const fmtEnd = format_date(endDate);
              const fmtStart = format_date(getValues('date'));
              const notWeekend =
                moment(fmtEnd).day() !== 0 && moment(fmtEnd).day() !== 6;
              return fmtEnd > fmtStart && notWeekend;
            },
          })}
        />
        {errors.endDate?.type === 'required' && (
          <p className={styles.error}>Please enter an end date</p>
        )}
        {errors.endDate?.type === 'validate' && (
          <p className={styles.error}>Invalid date</p>
        )}
      </div>
    </>
  );
};

type RideTimesProps = ModalPageProps & { defaultRepeating?: boolean };

const RideTimesPage = ({
  defaultRepeating = false,
  formData,
  onSubmit,
}: RideTimesProps) => {
  const [isRepeating, setIsRepeating] = useState(defaultRepeating);
  const { curDate } = useDate();
  const methods = useForm({
    defaultValues: {
      date: formData?.date ?? format_date(curDate),
      pickupTime: formData?.pickupTime ?? '',
      dropoffTime: formData?.dropoffTime ?? '',
      repeats: formData?.repeats ?? RepeatValues.DoesNotRepeat,
      endDate: formData?.endDate ?? '',
      days: formData?.days ?? {},
    },
  });
  const { errors, handleSubmit, register, getValues, watch } = methods;
  const watchRepeats = watch('repeats');

  useEffect(() => {
    setIsRepeating(watchRepeats !== RepeatValues.DoesNotRepeat);
  }, [watchRepeats]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={cn(styles.inputContainer, styles.rideTime)}>
          <div className={styles.col1}>
            <Label htmlFor="date" className={styles.label}>
              Date
            </Label>
            <Input
              className={styles.input}
              id="date"
              type="date"
              name="date"
              aria-required="true"
              ref={register({
                required: true,
                validate: (date) => {
                  const fmtDate = format_date(date);
                  const fmtCurr = format_date(curDate);
                  const notWeekend =
                    moment(date).day() !== 0 && moment(date).day() !== 6;
                  return fmtDate >= fmtCurr && notWeekend;
                },
              })}
            />
            {errors.date?.type === 'required' && (
              <p className={styles.error}>Please enter a date</p>
            )}
            {errors.date?.type === 'validate' && (
              <p className={styles.error}>
                Please enter a valid start date (No rides on weekends)
              </p>
            )}
          </div>
          <div className={styles.col2}>
            <Label htmlFor="repeats" className={styles.label}>
              Repeats:
            </Label>
            <select
              id="repeats"
              name="repeats"
              ref={register({ required: true })}
              aria-required="true"
              className={styles.input}
            >
              {Object.values(RepeatValues).map((repeatValue) => (
                <option key={repeatValue} value={repeatValue}>
                  {repeatValue}
                </option>
              ))}
            </select>
            {errors.repeats?.type === 'required' && (
              <p className={styles.error}>Please enter a time</p>
            )}
          </div>
          {isRepeating && <RepeatSection repeatValue={watchRepeats} />}
          <div className={styles.col1}>
            <Label htmlFor="pickupTime" className={styles.label}>
              Pickup time:
            </Label>
            <Input
              className={styles.input}
              id="pickupTime"
              type="time"
              name="pickupTime"
              aria-required="true"
              ref={register({
                required: true,
                validate: (pickupTime) => {
                  const date = getValues('date');
                  const pickup = moment(`${date} ${pickupTime}`);
                  return checkBounds(date, pickup);
                },
              })}
            />{' '}
            {errors.pickupTime?.type === 'required' && (
              <p className={styles.error}>Please choose a valid pickup time</p>
            )}
            {errors.pickupTime?.type === 'validate' && (
              <p className={styles.error}>Invalid time</p>
            )}
          </div>
          <div className={styles.col2}>
            <Label htmlFor="dropoffTime" className={styles.label}>
              Dropoff time:
            </Label>
            <Input
              className={styles.input}
              id="dropoffTime"
              type="time"
              name="dropoffTime"
              aria-required="true"
              ref={register({
                required: true,
                validate: (dropoffTime) => {
                  const pickupTime = getValues('pickupTime');
                  const date = getValues('date');
                  const dropoff = moment(`${date} ${dropoffTime}`);
                  return pickupTime < dropoffTime && checkBounds(date, dropoff);
                },
              })}
            />
            {errors.dropoffTime?.type === 'required' && (
              <p className={styles.error}>Please choose a valid pickup time</p>
            )}
            {errors.dropoffTime?.type === 'validate' && (
              <p className={styles.error}>Invalid time</p>
            )}
          </div>
        </div>
        <div className={styles.btnContainer}>
          <Button type="reset" className={styles.clearAllBtn}>
            <img src={trashIcon} className={styles.image} /> Clear All
          </Button>
          <Button type="submit" className={styles.nextBtn}>
            Next
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default RideTimesPage;
