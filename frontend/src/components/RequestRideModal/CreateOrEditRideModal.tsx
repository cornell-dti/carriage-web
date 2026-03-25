import React, { useContext, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import moment from 'moment';
import AuthContext from '../../context/auth';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType } from '../../types/index';
import { RideType } from '@carriage-web/shared/types/ride';
import styles from './requestridemodal.module.css';
import DateStep from './steps/DateStep';
import PickupLocationStep from './steps/PickupLocationStep';
import DropoffLocationStep from './steps/DropoffLocationStep';
import RequestSummaryStep from './steps/RequestSummaryStep';
import { RideModalType } from './types';
import { format_date } from '../../util/index';
import axios from '../../util/axios';
import { useToast, ToastStatus } from '../../context/toastContext';

type WizardStep = 'date' | 'pickup' | 'dropoff' | 'summary';

const stepOrder: WizardStep[] = ['date', 'pickup', 'dropoff', 'summary'];

type CreateOrEditRideModalProps = {
  isOpen: boolean;
  modalType: RideModalType;
  onSubmit?: () => void;
  onClose?: () => void;
  ride?: RideType;
};

const CreateOrEditRideModal = ({
  isOpen,
  modalType,
  onSubmit = () => {},
  onClose = () => {},
  ride,
}: CreateOrEditRideModalProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('date');
  const defaultStartDate = () => {
    if (ride) {
      if (
        modalType === 'EDIT_REGULAR' ||
        modalType === 'EDIT_SINGLE_RECURRING'
      ) {
        return format_date(ride.startTime);
      }
      if (modalType === 'EDIT_ALL_RECURRING') {
        return format_date(ride.startTime);
      }
    }
    return '';
  };

  const defaultValues = {
    startDate: defaultStartDate(),
    whenRepeat: ride?.isRecurring ? 'custom' : 'no-repeat',
    pickupTime: ride ? moment(ride.startTime).format('HH:mm') : '',
    dropoffTime: ride ? moment(ride.endTime).format('HH:mm') : '',
    recurring: ride?.isRecurring ?? false,
  };

  const methods = useForm({ defaultValues });
  const { id } = useContext(AuthContext);
  const formRef = useRef<HTMLFormElement>(null);
  const { showToast } = useToast();

  const closeModal = () => {
    setCurrentStep('date');
    methods.clearErrors();
    onClose();
  };

  const handleFormSubmit = async () => {
    const isValid = await methods.trigger();
    if (isValid) {
      methods.handleSubmit(handleSubmit)();
    }
  };

  const getStepFields = (step: WizardStep): string[] => {
    switch (step) {
      case 'date': {
        const isRepeating = methods.watch('recurring', false);
        const baseFields = ['startDate'];
        if (isRepeating) {
          return [...baseFields, 'whenRepeat', 'endDate'];
        }
        return baseFields;
      }
      case 'pickup':
        return ['startLocation', 'pickupTime'];
      case 'dropoff':
        return ['endLocation', 'dropoffTime'];
      case 'summary':
        return [];
      default:
        return [];
    }
  };

  const handleNext = async () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    const fieldsToValidate = getStepFields(currentStep);
    const isValid = await methods.trigger(fieldsToValidate as any);

    if (isValid && currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };
  const cleanData = (data: ObjectType) =>
    Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== null));

  const handleSubmit = async (formData: ObjectType) => {
    const {
      startDate,
      recurring,
      whenRepeat,
      Mon,
      Tue,
      Wed,
      Thu,
      Fri,
      startLocation,
      endLocation,
      pickupTime,
      dropoffTime,
      endDate,
      customPickup,
      pickupCity,
      pickupZip,
      customDropoff,
      dropoffCity,
      dropoffZip,
    } = formData;
    const startTime = moment(`${startDate} ${pickupTime}`).toISOString();
    const endTime = moment(`${startDate} ${dropoffTime}`).toISOString();
    const startLoc =
      startLocation !== 'Other'
        ? startLocation
        : `${customPickup}, ${pickupCity} NY, ${pickupZip}`;
    const endLoc =
      endLocation !== 'Other'
        ? endLocation
        : `${customDropoff}, ${dropoffCity} NY, ${dropoffZip}`;
    let rideData: ObjectType;
    // Check if it's a recurring ride (not "no-repeat")
    const isRecurringRide =
      recurring || (whenRepeat && whenRepeat !== 'no-repeat');
    if (isRecurringRide) {
      showToast(
        'Recurring rides are not yet supported. Please create a single ride instead.',
        ToastStatus.ERROR
      );
      return;
    } else {
      // Single ride (non-recurring) - "No repeat" or no repeat selection
      rideData = {
        startLocation: startLoc,
        endLocation: endLoc,
        rider: id,
        startTime,
        endTime,
        isRecurring: false,
        timezone: 'America/New_York',
      };
    }

    rideData = cleanData(rideData);

    const afterSubmit = () => {
      onSubmit();
      closeModal();
    };

    const handleError = (err: any) => {
      showToast(
        err?.response?.data?.message ?? 'Something went wrong. Please try again.',
        ToastStatus.ERROR
      );
    };

    if (!ride) {
      // create ride
      rideData.type = 'upcoming';
      rideData.schedulingState = 'unscheduled';
      axios.post('/api/rides', rideData).then(afterSubmit).catch(handleError);
    } else if (modalType === 'EDIT_SINGLE_RECURRING') {
      // edit single instance of recurring ride
      rideData.type = 'upcoming';
      rideData.schedulingState = 'unscheduled';
      axios
        .put(`/api/rides/${ride.id}/edits`, {
          deleteOnly: false,
          origDate: format_date(ride.startTime),
          ...rideData,
        })
        .then(afterSubmit)
        .catch(handleError);
    } else {
      // edit single ride - for now all rides are treated as single rides
      rideData.type = 'upcoming';
      rideData.schedulingState = 'unscheduled';
      axios
        .put(`/api/rides/${ride.id}`, rideData)
        .then(afterSubmit)
        .catch(handleError);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'date':
        return (
          <DateStep
            ride={ride}
            modalType={modalType}
            showRepeatingCheckbox={!ride}
            showRepeatingInfo={modalType !== 'EDIT_SINGLE_RECURRING'}
            onClose={closeModal}
            onNext={handleNext}
            currentStep={currentStep}
          />
        );
      case 'pickup':
        return (
          <PickupLocationStep
            ride={ride}
            modalType={modalType}
            currentStep={currentStep}
            onClose={closeModal}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'dropoff':
        return (
          <DropoffLocationStep
            ride={ride}
            modalType={modalType}
            currentStep={currentStep}
            onClose={closeModal}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'summary':
        return (
          <RequestSummaryStep
            onClose={closeModal}
            onNext={handleFormSubmit}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      title=""
      isOpen={isOpen}
      onClose={closeModal}
      displayClose={true}
      className={styles.requestRideModal}
    >
      <FormProvider {...methods}>
        <form
          ref={formRef}
          onSubmit={methods.handleSubmit(handleSubmit)}
          id="ride-form"
        >
          <div className={styles.inputContainer}>
            <div className={styles.wizardContainer}>
              <div className={styles.stepContent}>{renderStep()}</div>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};
export default CreateOrEditRideModal;
