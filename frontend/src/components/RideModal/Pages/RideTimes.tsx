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
import CalendarPicker from '../../Modal/CalendarPickerModal';
import CalandarModal from '../../Modal/CalendarModal';

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

  const [date, setDate] = React.useState<string>('');

  const isValidDay = (day: string) => {
    return day.length === 8 && day.indexOf('/') != day.lastIndexOf('/');
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={cn(styles.inputContainer, styles.rideTime)}>
          <div className={styles.col1}>
            <Label htmlFor="date">Day:</Label>
            {/* <CalandarModal /> */}
            <CalendarPicker
              callback={(date: any) => {
                console.log('this was called');
                const { day, month, year } = date;
                setDate(`${month}/${day}/${year}`);
              }}
              date={isValidDay(date) ? date : undefined}
            />

            <div id={'date-picker-container'}>
              <hr />
              <input
                type="text"
                value={date}
                onChange={(event: any) => {
                  event.preventDefault();
                  setDate(event.target.value);
                }}
              />
              <button
                onClick={() => {
                  // TODO: implement opening the modal here
                }}
              >
                Lol
              </button>
              <hr />
            </div>

            {/* <Input
              id="date"
              type="date"
              name="date"
              onChange={(date: any) => {
                console.log("Here's date: ");
                console.log(typeof date);
                console.log(date);

                setDate(date);
              }}
              // disabled
              // ref={register({
              //   required: true,
              //   validate: (date) => {
              //     const fmtDate = format_date(date);
              //     const fmtCurr = format_date(curDate);
              //     const notWeekend =
              //       moment(date).day() !== 0 && moment(date).day() !== 6;
              //     return fmtDate >= fmtCurr && notWeekend;
              //   },
              // })}
            /> */}

            {errors.date?.type === 'required' && (
              <p className={styles.error}>Please enter a date</p>
            )}
            {errors.date?.type === 'validate' && (
              <p className={styles.error}>Invalid date</p>
            )}
          </div>
          <div className={styles.col2}>
            <Label htmlFor="repeats">Repeats:</Label>
            <select
              id="repeats"
              name="repeats"
              ref={register({ required: true })}
              className={styles.select}
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
            <Label htmlFor="pickupTime">Pickup time:</Label>
            <Input
              id="pickupTime"
              type="time"
              name="pickupTime"
              ref={register({
                required: true,
                validate: (pickupTime) => {
                  const date = getValues('date');
                  const pickup = moment(`${date} ${pickupTime}`);
                  return checkBounds(date, pickup);
                },
              })}
            />
            {errors.pickupTime?.type === 'required' && (
              <p className={styles.error}>Please enter a time</p>
            )}
            {errors.pickupTime?.type === 'validate' && (
              <p className={styles.error}>Invalid time</p>
            )}
          </div>
          <div className={styles.col2}>
            <Label htmlFor="dropoffTime">Dropoff time:</Label>
            <Input
              id="dropoffTime"
              type="time"
              name="dropoffTime"
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
              <p className={styles.error}>Please enter a time</p>
            )}
            {errors.dropoffTime?.type === 'validate' && (
              <p className={styles.error}>Invalid time</p>
            )}
          </div>
        </div>
        <Button type="submit">Next</Button>
      </form>
    </FormProvider>
  );
};

export default RideTimesPage;
