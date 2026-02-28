import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Ride } from '../../types';
import { RideModalType } from './types';
import { Button } from '../FormElements/FormElements';
import DateStep from './steps/DateStep';
import PickupLocationStep from './steps/PickupLocationStep';
import DropoffLocationStep from './steps/DropoffLocationStep';
import RequestSummaryStep from './steps/RequestSummaryStep';
import styles from './requestridemodal.module.css';

export type WizardStep = 'date' | 'pickup' | 'dropoff' | 'summary';

type RequestRideWizardProps = {
    ride?: Ride;
    showRepeatingCheckbox: boolean;
    showRepeatingInfo: boolean;
    modalType: RideModalType;
    onSubmit?: () => void;
    onClose?: () => void;
};

const RequestRideWizard: React.FC<RequestRideWizardProps> = ({
    ride,
    showRepeatingCheckbox,
    showRepeatingInfo,
    modalType,
    onSubmit,
    onClose,
}) => {
    const [currentStep, setCurrentStep] = useState<WizardStep>('date');
    const {
        trigger,
        formState: { errors },
        watch,
    } = useFormContext();

    // Define step order - 4 steps including summary
    const stepOrder: WizardStep[] = ['date', 'pickup', 'dropoff', 'summary'];

    const currentStepIndex = stepOrder.indexOf(currentStep);
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === stepOrder.length - 1;

    // Get fields to validate for each step
    const getStepFields = (step: WizardStep): string[] => {
        switch (step) {
            case 'date':
                // Include repeat fields if repeating is enabled
                const watchRepeating = watch('recurring', false);
                const baseFields = ['startDate'];
                if (watchRepeating) {
                    return [...baseFields, 'whenRepeat', 'endDate'];
                }
                return baseFields;
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
        const fieldsToValidate = getStepFields(currentStep);
        const isValid = await trigger(fieldsToValidate as any);

        if (isValid) {
            const nextIndex = currentStepIndex + 1;
            if (nextIndex < stepOrder.length) {
                setCurrentStep(stepOrder[nextIndex]);
            }
        } else {
            // If validation fails, check if basic fields are filled
            // This allows navigation even if strict validation fails (will be caught on final submit)
            const basicFieldsFilled = fieldsToValidate.every(field => {
                const value = watch(field as any);
                return value && value !== '' && value !== undefined;
            });
            
            if (basicFieldsFilled) {
                const nextIndex = currentStepIndex + 1;
                if (nextIndex < stepOrder.length) {
                    setCurrentStep(stepOrder[nextIndex]);
                }
            }
        }
    };

    const handleBack = () => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setCurrentStep(stepOrder[prevIndex]);
        }
    };


    const renderStep = () => {
        switch (currentStep) {
            case 'date':
                return (
                    <DateStep
                        ride={ride}
                        modalType={modalType}
                        showRepeatingCheckbox={showRepeatingCheckbox}
                        showRepeatingInfo={showRepeatingInfo}
                        onClose={onClose}
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
                        onClose={onClose}
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
                        onClose={onClose}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );
            case 'summary':
                return (
                    <RequestSummaryStep
                        onClose={onClose}
                        onNext={onSubmit}
                        onBack={handleBack}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.wizardContainer}>
            {/* Step content */}
            <div className={styles.stepContent}>{renderStep()}</div>

            {/* Navigation buttons - removed Continue button, each step handles its own navigation */}
        </div>
    );
};

export default RequestRideWizard;
