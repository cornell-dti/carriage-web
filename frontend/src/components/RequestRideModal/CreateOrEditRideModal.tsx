import React, { useContext } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import moment from 'moment';
import AuthContext from '../../context/auth';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType, Ride } from '../../types/index';
import styles from './requestridemodal.module.css';
import RequestRideInfo from './RequestRideInfo';
import { RideModalType } from './types';
import { format_date } from '../../util/index';
import axios from '../../util/axios';

type CreateOrEditRideModalProps = {
  isOpen: boolean;
  modalType: RideModalType;
  onSubmit?: () => void;
  onClose?: () => void;
  ride?: Ride;
};

const CreateOrEditRideModal = ({
  isOpen,
  modalType,
  onSubmit = () => {},
  onClose = () => {},
  ride,
}: CreateOrEditRideModalProps) => {
  const defaultStartDate = () => {
    if (ride) {
      if (
        modalType === 'EDIT_REGULAR' ||
        modalType === 'EDIT_SINGLE_RECURRING'
      ) {
        return format_date(ride.startTime);
      }
      if (modalType === 'EDIT_ALL_RECURRING') {
        // For now, recurring rides aren't supported - treat as regular edit
        return format_date(ride.startTime);
      }
    }
    return format_date();
  };

  const defaultValues = {
    startDate: defaultStartDate(),
    whenRepeat: ride?.isRecurring ? 'custom' : undefined,
    pickupTime: ride ? moment(ride.startTime).format('HH:mm') : '',
    dropoffTime: ride ? moment(ride.endTime).format('HH:mm') : '',
    recurring: ride?.isRecurring ?? false,
  };

  const methods = useForm({ defaultValues });
  const { id } = useContext(AuthContext);

  const closeModal = () => {
    methods.clearErrors();
    onClose();
  };

  // Removes null fields from object
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
    if (recurring || whenRepeat) {
      // For now, block recurring rides as they're not fully implemented
      alert('Recurring rides are not yet supported. Please create a single ride instead.');
      return;
    } else {
      // Single ride (non-recurring)
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

    if (!ride) {
      // create ride
      rideData.type = 'unscheduled';
      axios.post('/api/rides', rideData).then(afterSubmit);
    } else if (modalType === 'EDIT_SINGLE_RECURRING') {
      // edit single instance of recurring ride
      rideData.type = 'unscheduled';
      axios
        .put(`/api/rides/${ride.id}/edits`, {
          deleteOnly: false,
          origDate: format_date(ride.startTime),
          ...rideData,
        })
        .then(afterSubmit);
    } else {
      // edit single ride - for now all rides are treated as single rides
      rideData.type = 'unscheduled';
      axios.put(`/api/rides/${ride.id}`, rideData).then(afterSubmit);
    }
  };

  return (
    <Modal
      title={!ride ? 'Request a Ride' : 'Edit Ride'}
      isOpen={isOpen}
      onClose={closeModal}
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <div className={styles.inputContainer}>
            <RequestRideInfo
              ride={ride}
              showRepeatingCheckbox={!ride}
              showRepeatingInfo={modalType !== 'EDIT_SINGLE_RECURRING'}
              modalType={modalType}
            />
            <Button className={styles.submit} type="submit">
              {!ride ? 'Request a Ride' : 'Edit Ride'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};
export default CreateOrEditRideModal;
