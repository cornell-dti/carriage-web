import React, { useEffect, useState } from 'react';
import {
  FormProvider,
  useForm,
  useFormContext,
  UseFormRegister,
  FieldErrors,
} from 'react-hook-form';
import cn from 'classnames';
import moment from 'moment';
import { ModalPageProps } from '../../Modal/types';
import { Button, Input, Label } from '../../FormElements/FormElements';
import styles from '../ridemodal.module.css';
import { useDate } from '../../../context/date';
import { format_date, checkBounds } from '../../../util/index';
import { ObjectType, RepeatValues } from '../../../types';
import { isHoliday } from 'util/holidays';

type FormData = {
  date: string;
  pickupTime: string;
  dropoffTime: string;
  repeats: RepeatValues;
  endDate: string;
  days: {
    [key: string]: string;
  };
};

const DaySelector = () => {
  const [selected, setSelected] = useState<ObjectType>({});
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext<FormData>();
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
      return { ...prev, [day]: '1' };
    });
  };

  useEffect(() => {
    Object.keys(dayLabels).forEach((day) => {
      const savedValue = getValues(`days.${day}`);
      if (savedValue === '1') {
        toggle(day);
      }
    });
  }, [getValues]);

  return (
    <>
      {Object.entries(dayLabels).map(([day, label]) => (
        <button
          key={day}
          type="button"
          className={cn(styles.day, {
            [styles.daySelected]: isSelected(day),
          })}
          onClick={() => toggle(day)}
          {...register(`days.${day}` as const, { validate })}
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

const RepeatSection: React.FC<RepeatSectionProps> = ({ repeatValue }) => {
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext<FormData>();

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
          {...register('endDate', {
            required: true,
            validate: (endDate: string) => {
              const fmtEnd = format_date(endDate);
              const fmtStart = format_date(getValues('date'));
              const notWeekend =
                moment(fmtEnd).day() !== 0 && moment(fmtEnd).day() !== 6;
              return fmtEnd > fmtStart && notWeekend;
            },
          })}
          aria-required="true"
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

const RideTimesPage: React.FC<RideTimesProps> = ({
  defaultRepeating = false,
  formData,
  onSubmit,
}) => {
  const [isRepeating, setIsRepeating] = useState(defaultRepeating);
  const { curDate } = useDate();
  const methods = useForm<FormData>({
    defaultValues: {
      date: formData?.date ?? format_date(curDate),
      pickupTime: formData?.pickupTime ?? '',
      dropoffTime: formData?.dropoffTime ?? '',
      repeats: formData?.repeats ?? RepeatValues.DoesNotRepeat,
      endDate: formData?.endDate ?? '',
      days: formData?.days ?? {},
    },
  });
  const {
    formState: { errors },
    handleSubmit,
    register,
    getValues,
    watch,
  } = methods;
  const watchRepeats = watch('repeats');
  const repeatOptions = Object.values(RepeatValues).map((value) => ({
    id: value,
    name: value,
  }));
  useEffect(() => {
    setIsRepeating(watchRepeats !== RepeatValues.DoesNotRepeat);
  }, [watchRepeats]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={cn(styles.inputContainer, styles.rideTime)}>
          <div className={styles.col1}>
            <Label htmlFor="date">Day:</Label>
            <Input
              id="date"
              type="date"
              {...register('date', {
                required: true,
                validate: (date: string) => {
                  const fmtDate = format_date(date);
                  const fmtCurr = format_date(curDate);
                  const notWeekend =
                    moment(date).day() !== 0 && moment(date).day() !== 6;
                  if (fmtDate < fmtCurr) {
                    return 'Please choose a future date.'; // can admin add rides same day?
                  } else if (
                    !notWeekend ||
                    isHoliday(new Date(`${fmtDate}T00:00:00`))
                  ) {
                    return 'Please enter a valid start date (No rides on weekends or university-wide breaks).';
                  }
                  return true;
                },
              })}
              aria-required="true"
              className={cn(styles.dateStyle)}
            />
            {errors.date?.type === 'required' && (
              <p className={styles.error}>Please enter a date</p>
            )}
            {errors.date?.type === 'validate' && (
              <p className={styles.error}>{errors.date.message}</p>
            )}
          </div>
          <div className={styles.col2}>
            <Label htmlFor="repeats">Repeats:</Label>
            <select
              id="repeats"
              {...register('repeats', {
                required: 'Please select a repeat option',
              })}
              className={cn(styles.selectInputContainer, styles.selectInput)}
            >
              {repeatOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            {errors.repeats?.type === 'required' && (
              <p className={styles.error}>Please enter a time</p>
            )}
          </div>
          {isRepeating && <RepeatSection repeatValue={watchRepeats} />}
          <div className={styles.col1}>
            <Label htmlFor="pickupTime">Pickup time:</Label>
            <Input
              id="pickupTime"
              type="time"
              className={cn(styles.timeStyle)}
              {...register('pickupTime', {
                required: true,
                validate: (pickupTime: string) => {
                  const date = getValues('date');
                  const pickup = moment(`${date} ${pickupTime}`);
                  return checkBounds(date, pickup);
                },
              })}
              aria-required="true"
            />
            {errors.pickupTime?.type === 'required' && (
              <p className={styles.error}>Please choose a valid pickup time</p>
            )}
            {errors.pickupTime?.type === 'validate' && (
              <p className={styles.error}>
                Please choose a time between 7:30 am and 10:00 pm
              </p>
            )}
          </div>
          <div className={styles.col2}>
            <Label htmlFor="dropoffTime">Dropoff time:</Label>
            <Input
              id="dropoffTime"
              type="time"
              className={cn(styles.timeStyle)}
              {...register('dropoffTime', {
                required: true,
                validate: (dropoffTime: string) => {
                  const pickupTime = getValues('pickupTime');
                  const date = getValues('date');
                  const pickupMoment = moment(`${date} ${pickupTime}`);
                  const dropoffMoment = moment(`${date} ${dropoffTime}`);
                  const duration = dropoffMoment.diff(pickupMoment, 'minutes');
                  if (!checkBounds(date, dropoffMoment)) {
                    return 'Please choose a time between 7:30 am and 10:00 pm';
                  } else if (duration < 5) {
                    return 'Dropoff time must be at least 5 minutes after pickup time';
                  }
                  return true;
                },
              })}
              // min="7:30"
              // max="22:00"
              aria-required="true"
            />
            {errors.dropoffTime?.type === 'required' && (
              <p className={styles.error}>Please choose a valid dropoff time</p>
            )}
            {errors.dropoffTime?.type === 'validate' && (
              <p className={styles.error}>{errors.dropoffTime.message}</p>
            )}
          </div>
        </div>
        <Button type="submit">Next</Button>
      </form>
    </FormProvider>
  );
};

export default RideTimesPage;
