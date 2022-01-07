import React, { useEffect, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import cn from 'classnames';
import moment from 'moment';
import { ModalPageProps } from '../../Modal/types';
import { Button, Input, Label } from '../../FormElements/FormElements';
import styles from '../ridemodal.module.css';
import { useDate } from '../../../context/date';
import { format_date, checkBounds } from '../../../util/index';

enum RepeatValues {
  DoesNotRepeat = 'Does Not Repeat',
  Daily = 'Daily',
  Weekly = 'Weekly',
  Custom = 'Custom',
}

type RepeatSectionProps = {
  repeatValue: RepeatValues;
};

const RepeatSection = ({ repeatValue }: RepeatSectionProps) => {
  const { register } = useFormContext();
  return (
    <div className={styles.colSpan}>
      <p>Hello</p>
      {repeatValue === RepeatValues.Custom && <p>Custom</p>}
    </div>
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
            <Label htmlFor="date">Date:</Label>
            <Input
              id="date"
              type="date"
              name="date"
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
