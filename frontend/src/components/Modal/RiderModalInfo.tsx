import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import { Button, Input, Label } from '../FormElements/FormElements';
import styles from './ridermodal.module.css';
import { ObjectType, Accessibility, Rider } from '../../types/index';

type ModalFormProps = {
  onSubmit: (data: ObjectType) => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFormData: React.Dispatch<React.SetStateAction<ObjectType>>;
  rider?: Rider;
};

const RiderModalInfo = ({
  onSubmit,
  setIsOpen,
  setFormData,
  rider,
}: ModalFormProps) => {
  const fullName =
    rider?.firstName && rider?.lastName
      ? rider?.firstName + ' ' + rider?.lastName
      : '';

  const [checkedNeeds, setCheckedNeeds] = useState<string[]>([]);
  const [extraNeedsInput, setExtraNeedsInput] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [arrowRotation, setArrowRotation] = useState(270);

  const { register, formState, handleSubmit, getValues } = useForm({
    defaultValues: {
      name: fullName ?? '',
      netid: rider?.email.split('@')[0] ?? '',
      phoneNumber: rider?.phoneNumber ?? '',
      needs: rider?.accessibility ?? '', // if no needs, default is undefined
      address: rider?.address ?? '',
      joinDate: rider?.joinDate ?? '',
      endDate: rider?.endDate ?? '',
    },
  });

  const { errors } = formState;

  const beforeSubmit = ({
    name,
    netid,
    phoneNumber,
    otherNeeds,
    address,
    joinDate,
    endDate,
  }: ObjectType) => {
    const email = netid ? `${netid}@cornell.edu` : undefined;

    const accessibility = otherNeeds
      ? checkedNeeds.join(',') + `,Other:${otherNeeds}`
      : checkedNeeds.join(',');

    const nameParts = name.trim().split(/\s+/);
    const firstName =
      nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(-1)[0] : '';

    onSubmit({
      firstName,
      lastName,
      email,
      phoneNumber,
      accessibility,
      address,
      joinDate,
      endDate,
    });
  };

  const cancel = () => {
    setFormData({});
    setIsOpen(false);
  };

  const handleDropDown = () => {
    setDropdown(!dropdown);
    setArrowRotation(dropdown ? 270 : 90);
  };

  const handleCheckboxChange = (e: {
    target: { value: string; checked: boolean };
  }) => {
    const need = e.target.value;
    const checked = e.target.checked;

    if (checked) {
      setCheckedNeeds((pre) => [...pre, need]);
    } else {
      setCheckedNeeds((pre) => pre.filter((n) => n !== need));
    }
  };

  const handleNext = () => {
    setExtraNeedsInput(checkedNeeds.includes('Other') ? true : false);
    setDropdown(!dropdown);
    setCheckedNeeds(checkedNeeds.filter((value) => value != 'Other'));
  };

  const localUserType = localStorage.getItem('userType');
  const isEditing = rider !== undefined;
  const isStudentEditing = isEditing && localUserType === 'Rider';

  return (
    <form onSubmit={handleSubmit(beforeSubmit)} className={styles.form}>
      <div className={styles.flexInputContainer}>
        <div className={styles.flexRow}>
          <div>
            <Input
              id="name"
              name="name"
              placeholder="Name"
              type="text"
              ref={register({ required: true })}
              aria-required="true"
              className={cn(styles.firstRow, styles.flexItems)}
            />
            {errors.name && (
              <p className={styles.error}>Name cannot be empty</p>
            )}
          </div>

          <div>
            <Input
              id="netid"
              name="netid"
              placeholder="NetID"
              type="text"
              ref={register({ required: true, pattern: /^[a-zA-Z]+[0-9]+$/ })}
              disabled={isStudentEditing}
              className={cn(styles.firstRow, styles.flexItems)}
              aria-required="true"
            />
            {errors.netid && (
              <p className={styles.error}>NetId cannot be empty</p>
            )}
          </div>

          <div>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              placeholder="Phone Number"
              type="tel"
              ref={register({ required: true, pattern: /^[0-9]{10}$/ })}
              className={cn(styles.firstRow, styles.flexItems)}
              aria-required="true"
            />

            {errors.phoneNumber && (
              <p className={styles.error}>Phone number is not valid</p>
            )}
          </div>
        </div>

        <div className={styles.flexRow}>
          <div>
            <p
              className={cn(
                styles.flexNeeds,
                styles.flexItems,
                styles.dropdownHead
              )}
              onClick={() => handleDropDown()}
            >
              Needs
              <span
                className={styles.arrow}
                style={{ transform: `rotate(${arrowRotation}deg)` }}
              >
                &#171;
              </span>
            </p>

            {dropdown && (
              <ul className={cn(styles.checkboxDropdownList)}>
                {Object.values(Accessibility)
                  .filter((value) => value !== '')
                  .sort((a, b) => {
                    if (a === 'Other') return 1;
                    if (b === 'Other') return -1;
                    return a.localeCompare(b);
                  })
                  .map((value, index) => {
                    const isChecked = checkedNeeds.includes(value);
                    return (
                      <li key={index} className={styles.dropdownItems}>
                        <Input
                          type="checkbox"
                          value={value}
                          id={`checkbox-${index}`}
                          onChange={handleCheckboxChange}
                          checked={isChecked}
                        />
                        <label
                          className={styles.dropdownLabels}
                          htmlFor={`checkbox-${index}`}
                        >
                          {value}
                        </label>
                      </li>
                    );
                  })}
                <Button
                  type="button"
                  className={styles.next}
                  onClick={() => handleNext()}
                >
                  Next
                </Button>
              </ul>
            )}

            {errors.needs?.type === 'validate' && (
              <p className={styles.error}>
                Invalid needs. You can enter 'Assistant', 'Crutches', or
                'Wheelchair'
              </p>
            )}
          </div>

          <div>
            {/* Conditionally render other field when Next button is clicked */}
            {extraNeedsInput && (
              <div className={styles.hiddenFlex}>
                <p className={styles.flexItems}>Other</p>

                <Input
                  id="otherNeeds"
                  name="otherNeeds"
                  className={cn(
                    styles.flexNeeds,
                    styles.flexItems,
                    styles.hiddenFlexInput,
                    styles.firstRow
                  )}
                  type="text"
                  placeholder="Input text..."
                  aria-required="true"
                  ref={register({
                    required: true,
                    pattern: /^[a-zA-Z0-9\s,.'-]{3,}$/,
                  })}
                />

                {errors.needs?.type === 'validate' && (
                  <p className={styles.error}>
                    Invalid needs. You can enter 'Assistant', 'Crutches', or
                    'Wheelchair'
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <Input
              id="address"
              name="address"
              className={styles.flexItems}
              type="text"
              placeholder="Address"
              aria-required="true"
              ref={register({
                required: true,
                pattern: /^[a-zA-Z0-9\s,.'-]{3,}$/,
              })}
            />
            {errors.address && (
              <p className={styles.error}>Please enter an address</p>
            )}
          </div>
        </div>

        <p className={styles.duration}>Duration</p>

        <div className={styles.flexRow}>
          <div>
            <div className={styles.flexTo}>
              <Input
                id="joinDate"
                type="date"
                name="joinDate"
                aria-required="true"
                ref={register({ required: true })}
                disabled={isStudentEditing}
                className={cn(
                  styles.flexItems,
                  styles.riderDate,
                  styles.flexDate
                )}
              />
              <p>to</p>
            </div>

            {errors.joinDate && (
              <p className={styles.error}>Please enter a join date</p>
            )}
          </div>

          <div>
            <Input
              id="endDate"
              type="date"
              name="endDate"
              aria-required="true"
              ref={register({
                required: true,
                validate: (endDate) => {
                  const joinDate = getValues('joinDate');
                  return joinDate < endDate;
                },
              })}
              disabled={isStudentEditing}
              className={cn(
                styles.flexItems,
                styles.riderDate,
                styles.flexDate
              )}
            />
            {errors.endDate?.type === 'required' && (
              <p className={styles.error}>Please enter an end date</p>
            )}
            {errors.endDate?.type === 'validate' && (
              <p className={styles.error}>Invalid end time</p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <Button
          type="button"
          className={styles.cancel}
          outline={true}
          onClick={() => cancel()}
        >
          Cancel
        </Button>
        <Button type="submit" className={styles.submit}>
          {isEditing ? 'Edit a Student' : 'Add a Student'}
        </Button>
      </div>
    </form>
  );
};

export default RiderModalInfo;
