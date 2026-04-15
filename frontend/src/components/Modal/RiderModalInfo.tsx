import React, { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import Select, { StylesConfig } from 'react-select';
import { Button, Input, Label } from '../FormElements/FormElements';
import { ObjectType, Accessibility } from '../../types/index';
import { RiderType } from '@carriage-web/shared/types/rider';

type ModalFormProps = {
  onSubmit: (data: ObjectType) => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFormData: React.Dispatch<React.SetStateAction<ObjectType>>;
  rider?: RiderType;
};

type NeedOption = {
  value: Accessibility | string;
  label: string;
};

type FormData = {
  firstName: string;
  lastName: string;
  netid: string;
  phoneNumber: string;
  needs: NeedOption[];
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

  const makeNameValidator =
    (fieldLabel: 'First name' | 'Last name') => (value: string) => {
      const trimmed = value.trim();

      if (!trimmed) {
        return `${fieldLabel} cannot be empty`;
      }

      if (trimmed === trimmed.toLowerCase()) {
        return `Please capitalize the ${fieldLabel.toLowerCase()}`;
      }

      return true;
    };

  const normalizePhoneNumber = (value: string) => value.replace(/\D/g, '');

  const validatePhoneNumber = (value: string) => {
    const digits = normalizePhoneNumber(value);

    if (!digits) {
      return 'Phone number is required';
    }

    if (digits.length !== 10) {
      return 'Phone number must contain exactly 10 digits';
    }

    return true;
  };

  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    getValues,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      firstName: rider?.firstName ?? '',
      lastName: rider?.lastName ?? '',
      netid: rider?.email.split('@')[0] ?? '',
      phoneNumber: rider?.phoneNumber ?? '',
      needs:
        rider?.accessibility?.map((need) => ({
          value: need as Accessibility,
          label: need,
        })) ?? [],
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
    firstName,
    lastName,
    netid,
    phoneNumber,
    needs,
    joinDate,
    endDate,
  }) => {
    const email = netid ? `${netid.toLowerCase()}@cornell.edu` : undefined;
    const accessibility = needs.map((option) => option.value.toString());
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

    const today = new Date().toISOString().slice(0, 10);
    const active = joinDate <= today && today <= endDate;

    const payload = {
      firstName,
      lastName,
      email,
      phoneNumber: normalizedPhoneNumber,
      accessibility,
      joinDate,
      endDate,
      active,
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
    <form onSubmit={handleSubmit(beforeSubmit)} className="flex flex-col w-full h-full">
      <div className="mb-6 w-full grid grid-cols-12 gap-5 [@media(max-width:1092px)]:flex [@media(max-width:1092px)]:flex-col [@media(max-width:1092px)]:gap-5">
        <div className="row-start-1 col-start-1 col-span-4">
          <Label className="block mb-2 font-semibold text-[#333] [@media(max-width:1092px)]:font-bold" htmlFor="firstName">
            First Name:{' '}
          </Label>
          <Input
            id="firstName"
            type="text"
            {...register('firstName', {
              validate: makeNameValidator('First name'),
            })}
            aria-required="true"
            className="w-full"
          />
          {errors.firstName && (
            <p className="text-[#dc3545] text-xs mt-1">
              {errors.firstName.message ?? 'First name cannot be empty'}
            </p>
          )}
        </div>

        <div className="row-start-1 col-start-5 col-span-3">
          <Label className="block mb-2 font-semibold text-[#333] [@media(max-width:1092px)]:font-bold" htmlFor="lastName">
            Last Name:{' '}
          </Label>
          <Input
            id="lastName"
            type="text"
            {...register('lastName', {
              validate: makeNameValidator('Last name'),
            })}
            aria-required="true"
            className="w-full"
          />
          {errors.lastName && (
            <p className="text-[#dc3545] text-xs mt-1">
              {errors.lastName.message ?? 'Last name cannot be empty'}
            </p>
          )}
        </div>

        <div className="row-start-1 col-start-8 col-span-5">
          <Label className="block mb-2 font-semibold text-[#333] [@media(max-width:1092px)]:font-bold" htmlFor="netid">
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
            className="w-full"
            aria-required="true"
          />
          {errors.netid && <p className="text-[#dc3545] text-xs mt-1">Invalid NetID</p>}
        </div>

        <div className="row-start-2 col-start-1 col-span-6">
          <Label className="block mb-2 font-semibold text-[#333] [@media(max-width:1092px)]:font-bold" htmlFor="phoneNumber">
            Phone Number:{' '}
          </Label>
          <Input
            id="phoneNumber"
            {...register('phoneNumber', {
              validate: validatePhoneNumber,
            })}
            type="tel"
            className="w-full"
            aria-required="true"
            style={{ height: '60px' }}
          />
          {errors.phoneNumber && (
            <p className="text-[#dc3545] text-xs mt-1">
              {errors.phoneNumber.message ?? 'Phone number is not valid'}
            </p>
          )}
        </div>

        <div className="row-start-2 col-start-7 col-span-6">
          <Label className="block mb-2 font-semibold text-[#333] [@media(max-width:1092px)]:font-bold" htmlFor="needs">
            Needs:{' '}
          </Label>
          <div className="flex flex-col gap-2">
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
                  className="w-full"
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
              <div className="flex items-center gap-2 mt-2">
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
                  className="flex-1 h-8 px-3 border border-[#ced4da] rounded text-sm focus:outline-none focus:border-black focus:[box-shadow:0_0_0_2px_rgba(0,0,0,0.1)]"
                  autoFocus
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={handleAddCustomNeed}
                    className="flex items-center justify-center w-8 h-8 border border-[#28a745] rounded bg-white cursor-pointer text-base text-[#28a745] transition-all duration-200 hover:bg-[#28a745] hover:text-white"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelCustomNeed}
                    className="flex items-center justify-center w-8 h-8 border border-[#dc3545] rounded bg-white cursor-pointer text-base text-[#dc3545] transition-all duration-200 hover:bg-[#dc3545] hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            {errors.needs && (
              <p className="text-[#dc3545] text-xs mt-1">Please select at least one need</p>
            )}
          </div>
        </div>

        <div className="row-start-3 col-start-1 col-span-7">
          <p>Duration</p>
          <div className="flex gap-5 items-center [@media(max-width:1092px)]:flex-col [@media(max-width:1092px)]:gap-4">
            <div>
              <Label className="block mb-2 font-semibold text-[#333] [@media(max-width:1092px)]:font-bold" htmlFor="joinDate">
                Join Date:{' '}
              </Label>
              <Input
                id="joinDate"
                {...register('joinDate', { required: true })}
                type="date"
                aria-required="true"
                disabled={isStudentEditing}
                className="w-full min-w-50"
              />
              {errors.joinDate && (
                <p className="text-[#dc3545] text-xs mt-1">Please enter a join date</p>
              )}
            </div>
            <div className="text-2xl h-full">
              <p>→</p>
            </div>
            <div>
              <Label className="block mb-2 font-semibold text-[#333] [@media(max-width:1092px)]:font-bold" htmlFor="endDate">
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
                className="w-full min-w-50"
              />
              {errors.endDate?.type === 'required' && (
                <p className="text-[#dc3545] text-xs mt-1">Please enter an end date</p>
              )}
              {errors.endDate?.type === 'validate' && (
                <p className="text-[#dc3545] text-xs mt-1">Invalid end time</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8 gap-4 [@media(max-width:1092px)]:flex-col">
        <Button
          type="button"
          className="bg-white text-black border border-black hover:bg-black hover:text-white [@media(max-width:1092px)]:w-full"
          outline={true}
          onClick={() => cancel()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-black text-white border-none hover:bg-[#333] [@media(max-width:1092px)]:w-full"
        >
          {isEditing ? 'Edit a Student' : 'Add a Student'}
        </Button>
      </div>
    </form>
  );
};

export default RiderModalInfo;
