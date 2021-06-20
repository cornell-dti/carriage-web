import React, { useState, useContext } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import moment from 'moment';
import DeleteOrEditTypeModal from '../Modal/DeleteOrEditTypeModal';
import AuthContext from '../../context/auth';
import { useReq } from '../../context/req';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType, Ride } from '../../types/index';
import Toast from '../ConfirmationToast/ConfirmationToast';
import styles from './requestridemodal.module.css';
import RequestRideInfo from './RequestRideInfo';

type CreateOrEditRideModalProps = {
  afterSubmit?: () => void;
  ride?: Ride;
}

const CreateOrEditRideModal = ({ afterSubmit = () => { }, ride }: CreateOrEditRideModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [typeModalIsOpen, setTypeModalIsOpen] = useState(false);
  const [showingToast, setToast] = useState(false);
  const [editSingleRecurring, setEditSingleRecurring] = useState<null | boolean>(false);
  const defaultValues = {
    startDate: moment(ride?.startTime).format('YYYY-MM-DD') ?? moment().format('YYYY-MM-DD'),
    whenRepeat: ride?.recurring ? 'custom' : undefined,
    endDate: ride?.endDate ?? '',
    pickupTime: ride ? moment(ride.startTime).format('HH:mm') : '',
    dropoffTime: ride ? moment(ride.endTime).format('HH:mm') : '',
    recurring: ride?.recurring ?? false,
  };
  const methods = useForm({ defaultValues });
  const { withDefaults } = useReq();
  const { id } = useContext(AuthContext);

  const openModal = () => {
    setIsOpen(true);
    setToast(false);
  };

  const openTypeModal = () => {
    setTypeModalIsOpen(true);
  };

  const closeModal = () => {
    methods.clearErrors();
    setIsOpen(false);
  };

  const closeTypeModal = () => {
    setTypeModalIsOpen(false);
  };

  const onSubmit = async (formData: ObjectType) => {
    const {
      startDate, recurring, whenRepeat, Mon, Tue, Wed, Thu, Fri,
      startLocation, endLocation, pickupTime, dropoffTime, endDate,
      customPickup, pickupCity, pickupZip, customDropoff,
      dropoffCity, dropoffZip,
    } = formData;
    const startTime = moment(`${startDate} ${pickupTime}`).toISOString();
    const endTime = moment(`${startDate} ${dropoffTime}`).toISOString();
    const startLoc = startLocation !== 'Other'
      ? startLocation
      : `${customPickup}, ${pickupCity} NY, ${pickupZip}`;
    const endLoc = endLocation !== 'Other'
      ? endLocation
      : `${customDropoff}, ${dropoffCity} NY, ${dropoffZip}`;
    let rideData: ObjectType;
    if (recurring) {
      // Add a repeating ride
      let recurringDays: Number[] = [];
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
        type: 'unscheduled',
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
        type: 'unscheduled',
        startLocation: startLoc,
        endLocation: endLoc,
        rider: id,
        startTime,
        endTime,
      };
    }
    const afterReq = () => {
      afterSubmit();
      closeModal();
      setToast(true);
    };
    if (!ride) {
      // create ride
      fetch('/api/rides', withDefaults({
        method: 'POST',
        body: JSON.stringify(rideData),
      })).then(afterReq);
    } else if (editSingleRecurring) {
      // edit single instance of recurring ride
      fetch(`/api/rides/${ride.id}/edits`, withDefaults({
        method: 'PUT',
        body: JSON.stringify({
          deleteOnly: false,
          origDate: startDate,
          ...rideData,
        }),
      })).then(afterReq);
    } else {
      // edit regular ride or all recurring rides by editing parent ride
      fetch(`/api/rides/${ride.id}`, withDefaults({
        method: 'PUT',
        body: JSON.stringify(rideData),
      })).then(afterReq);
    }
  };


  return (
    <>
      {!ride
        ? <Button onClick={openModal}>+ Request a ride</Button>
        : <Button outline small onClick={ride.recurring ? openTypeModal : openModal}>Edit</Button>}
      {showingToast ? <Toast message={`Your ride has been ${!ride ? 'created' : 'edited'}`} /> : null}
      {ride && ride.recurring && <DeleteOrEditTypeModal
        open={typeModalIsOpen}
        onClose={closeTypeModal}
        ride={ride}
        deleting={false}
        onNext={(single) => {
          setEditSingleRecurring(single);
          closeTypeModal();
          openModal();
        }} // TODO
      />}
      {
        <Modal
          title={!ride ? 'Request a Ride' : 'Edit Ride'}
          isOpen={isOpen}
          onClose={closeModal}
        >
          <FormProvider {...methods} >
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <div className={styles.inputContainer}>
                <RequestRideInfo ride={ride} showRepeatingCheckbox={!ride}
                  showRepeatingInfo={!editSingleRecurring} />
                <Button className={styles.submit} type='submit'>
                  {!ride ? 'Request a Ride' : 'Edit Ride'}
                </Button>
              </div>
            </form>
          </FormProvider>
        </Modal>
      }
    </>
  );
};
export default CreateOrEditRideModal;
