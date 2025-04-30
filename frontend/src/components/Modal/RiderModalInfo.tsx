import React, { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import Select, { StylesConfig } from 'react-select';
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

type NeedOption = {
  value: Accessibility | string;
  label: string;
};

type FormData = {
  name: string;
  netid: string;
  phoneNumber: string;
  needs: NeedOption[];
  address: string;
  joinDate: string;
  endDate: string;
  otherNeeds?: string;
};

const RiderModalInfo: React.FC<ModalFormProps> = ({
  onSubmit,
  setIsOpen,
  setFormData,
  rider,
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customNeed, setCustomNeed] = useState('');

  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    getValues,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      name: (rider?.firstName ?? '') + (rider?.lastName ?? ''),
      netid: rider?.email.split('@')[0] ?? '',
      phoneNumber: rider?.phoneNumber ?? '',
      needs:
        rider?.accessibility?.map((need) => ({
          value: need as Accessibility,
          label: need,
        })) ?? [],
      address: rider?.address ?? '',
      joinDate: rider?.joinDate ?? '',
      endDate: rider?.endDate ?? '',
    },
  });

  const customStyles: StylesConfig<NeedOption, true> = {
    option: (baseStyles, { data }) => ({
      ...baseStyles,
      ...(data.value === 'OTHER' && {
        color: '#0066cc',
        fontStyle: 'italic',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e9ecef',
        marginTop: '4px',
        paddingTop: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        '&:before': {
          content: '"+"',
          marginRight: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
        },
        '&:hover': {
          backgroundColor: '#e9ecef',
          color: '#004c99',
        },
      }),
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      padding: '4px 0',
    }),
  };

  const handleNeedsChange = (
    selectedOptions: readonly NeedOption[] | null,
    { action }: any
  ) => {
    if (selectedOptions?.some((option) => option.value === 'OTHER')) {
      const filteredOptions = [
        ...selectedOptions.filter((opt) => opt.value !== 'OTHER'),
      ];
      setValue('needs', filteredOptions);
      setShowCustomInput(true);
      setCustomNeed('');
    } else {
      setValue('needs', selectedOptions ? [...selectedOptions] : []);
      setShowCustomInput(false);
    }
  };

  const handleAddCustomNeed = () => {
    if (customNeed.trim()) {
      const currentNeeds = getValues('needs') || [];
      const newNeed: NeedOption = {
        value: customNeed.toUpperCase().replace(/\s+/g, '_'),
        label: customNeed.trim(),
      };

      setValue('needs', [...currentNeeds, newNeed]);
      setCustomNeed('');
      setShowCustomInput(false);
    }
  };

  const handleCancelCustomNeed = () => {
    setCustomNeed('');
    setShowCustomInput(false);
  };

  const beforeSubmit: SubmitHandler<FormData> = ({
    name,
    netid,
    phoneNumber,
    needs,
    address,
    joinDate,
    endDate,
  }) => {
    const email = netid ? `${netid}@cornell.edu` : undefined;
    const accessibility = needs.map((option) => option.value.toString());
    const nameParts = name.trim().split(/\s+/);
    const firstName =
      nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(-1)[0] : '';

    const payload = {
      firstName,
      lastName,
      email,
      phoneNumber,
      accessibility,
      address,
      joinDate,
      endDate,
    };

    console.log('Form payload:', payload);
    onSubmit(payload);
  };

  const cancel = () => {
    setFormData({});
    setIsOpen(false);
  };

  const localUserType = localStorage.getItem('userType');
  const isEditing = rider !== undefined;
  const isStudentEditing = isEditing && localUserType === 'Rider';

  const needsOptions: NeedOption[] = [
    ...Object.values(Accessibility).map((value) => ({
      value: value as Accessibility,
      label: value,
    })),
    { value: 'OTHER', label: 'Add Custom Need' },
  ];

  return (
    <form onSubmit={handleSubmit(beforeSubmit)} className={styles.form}>
      <div className={cn(styles.inputContainer, styles.rideTime)}>
        <div className={cn(styles.gridR1, styles.gridCSmall1)}>
          <Label className={styles.label} htmlFor="name">
            Name:{' '}
          </Label>
          <Input
            id="name"
            type="text"
            {...register('name', {
              required: true,
            })}
            aria-required="true"
            className={styles.firstRow}
          />
          {errors.name && <p className={styles.error}>Name cannot be empty</p>}
        </div>

        <div className={cn(styles.gridR1, styles.gridCSmall2)}>
          <Label className={styles.label} htmlFor="netid">
            NetID:{' '}
          </Label>
          <Input
            id="netid"
            {...register('netid', {
              required: true,
              pattern: /^[a-zA-Z]+[0-9]+$/,
            })}
            type="text"
            disabled={isStudentEditing}
            className={styles.firstRow}
            aria-required="true"
          />
          {errors.netid && (
            <p className={styles.error}>NetId cannot be empty</p>
          )}
        </div>

        <div className={cn(styles.gridR1, styles.gridCSmall3)}>
          <Label className={styles.label} htmlFor="phoneNumber">
            Phone Number:{' '}
          </Label>
          <Input
            id="phoneNumber"
            {...register('phoneNumber', {
              required: true,
              pattern: /^[0-9]{10}$/,
            })}
            type="tel"
            className={styles.firstRow}
            aria-required="true"
          />
          {errors.phoneNumber && (
            <p className={styles.error}>Phone number is not valid</p>
          )}
        </div>

        <div className={cn(styles.gridR2, styles.gridCBig1)}>
          <Label className={styles.label} htmlFor="needs">
            Needs:{' '}
          </Label>
          <div className={styles.needsContainer}>
            <Controller
              name="needs"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value, ...field } }) => (
                <Select<NeedOption, true>
                  {...field}
                  value={value}
                  isMulti
                  options={needsOptions}
                  className={styles.customSelect}
                  classNamePrefix="customSelectValueContainer"
                  placeholder="Select needs..."
                  styles={customStyles}
                  onChange={(newValue, actionMeta) =>
                    handleNeedsChange(newValue, actionMeta)
                  }
                />
              )}
            />
            {showCustomInput && (
              <div className={styles.customNeedInput}>
                <input
                  type="text"
                  value={customNeed}
                  onChange={(e) => setCustomNeed(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomNeed();
                    }
                  }}
                  placeholder="Type custom need"
                  className={styles.customNeedField}
                  autoFocus
                />
                <div className={styles.customNeedActions}>
                  <button
                    type="button"
                    onClick={handleAddCustomNeed}
                    className={styles.customNeedButton}
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelCustomNeed}
                    className={styles.customNeedButton}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            {errors.needs && (
              <p className={styles.error}>Please select at least one need</p>
            )}
          </div>
        </div>

        <div className={cn(styles.gridR2, styles.gridCBig2)}>
          <Label className={styles.label} htmlFor="address">
            Address:{' '}
          </Label>
          <Input
            id="address"
            {...register('address', {
              required: true,
              pattern: /^(?!\s*$).+/,
            })}
            type="text"
            aria-required="true"
            style={{ height: '60px' }}
          />
          {errors.address && (
            <p className={styles.error}>Please enter an address</p>
          )}
        </div>

        <div className={cn(styles.gridR3, styles.gridCAll)}>
          <p>Duration</p>
          <div className={styles.lastRow}>
            <div>
              <Label className={styles.label} htmlFor="joinDate">
                Join Date:{' '}
              </Label>
              <Input
                id="joinDate"
                {...register('joinDate', { required: true })}
                type="date"
                aria-required="true"
                disabled={isStudentEditing}
                className={styles.riderDate}
              />
              {errors.joinDate && (
                <p className={styles.error}>Please enter a join date</p>
              )}
            </div>
            <div className={styles.to}>
              <p>→</p>
            </div>
            <div>
              <Label className={styles.label} htmlFor="endDate">
                End Date:{' '}
              </Label>
              <Input
                id="endDate"
                {...register('endDate', {
                  required: true,
                  validate: (endDate) => {
                    const joinDate = getValues('joinDate');
                    return joinDate < endDate;
                  },
                })}
                type="date"
                aria-required="true"
                disabled={isStudentEditing}
                className={styles.riderDate}
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
