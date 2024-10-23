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
import { LocationsProvider } from '../../context/LocationsContext';
import axios from '../../util/axios';

//this is for rider????


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
  // console.log("FUCKKKK");
  const defaultStartDate = () => {
    if (ride) {
      if (
        modalType === 'EDIT_REGULAR' ||
        modalType === 'EDIT_SINGLE_RECURRING'
      ) {
        return format_date(ride.startTime);
      }
      if (modalType === 'EDIT_ALL_RECURRING') {
        return format_date(ride.parentRide?.startTime);
      }
    }
    return format_date();
  };

  const defaultValues = {
    startDate: defaultStartDate(),
    whenRepeat: ride?.recurring ? 'custom' : undefined,
    endDate: ride?.endDate ?? '',
    pickupTime: ride ? moment(ride.startTime).format('HH:mm') : '',
    dropoffTime: ride ? moment(ride.endTime).format('HH:mm') : '',
    recurring: ride?.recurring ?? false,
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
      // Add a repeating ride
      let recurringDays: number[] = [];
      switch (whenRepeat) {
        case 'daily': {
          recurringDays = [1, 2, 3, 4, 5];
          break;
        }
        case 'weekly': {
          recurringDays = [moment(`${startDate}`).toDate().getDay()];
          break;
        }
        case 'custom': {
          if (Number(Mon) !== -1) {
            recurringDays.push(Number(Mon));
          }
          if (Number(Tue) !== -1) {
            recurringDays.push(Number(Tue));
          }
          if (Number(Wed) !== -1) {
            recurringDays.push(Number(Wed));
          }
          if (Number(Thu) !== -1) {
            recurringDays.push(Number(Thu));
          }
          if (Number(Fri) !== -1) {
            recurringDays.push(Number(Fri));
          }
          break;
        }
        default: {
          recurringDays = [moment(`${startDate}`).toDate().getDay()];
          break;
        }
      }
      rideData = {
        startLocation: startLoc,
        endLocation: endLoc,
        rider: id,
        startTime,
        endTime,
        recurring,
        recurringDays,
        endDate,
      };
    } else {
      // Not repeating
      rideData = {
        startLocation: startLoc,
        endLocation: endLoc,
        rider: id,
        startTime,
        endTime,
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
      // edit regular ride or all recurring rides by editing parent ride
      if (
        !ride.parentRide ||
        (ride.parentRide && ride.parentRide.type === 'active')
      ) {
        rideData.type = 'unscheduled';
      }
      axios.put(`/api/rides/${ride.id}`, rideData).then(afterSubmit);
    }
  };

  return (
    <LocationsProvider>
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
    </LocationsProvider>
  );
};
export default CreateOrEditRideModal;
