import React, { useState } from 'react';
import moment from 'moment';
import Modal from './Modal';
import { Ride } from '../../types/index';
import { Button, Input, Label } from '../FormElements/FormElements';
import { useReq } from '../../context/req';
import styles from './editOrDeleteModals.module.css';

type DeleteRideModalProps = {
  open: boolean,
  ride: Ride,
  onClose: () => void,
}

const DeleteRideModal = ({ open, ride, onClose }: DeleteRideModalProps) => {
  const [single, setSingle] = useState(true);
  const { withDefaults } = useReq();

  const closeModal = () => {
    onClose();
  };

  const confirmCancel = () => {
    if (ride.recurring && single) {
      const startDate = moment(ride.startTime).format('YYYY-MM-DD');
      fetch(`/api/rides/${ride.id}/edits`, withDefaults({
        method: 'PUT',
        body: JSON.stringify({
          deleteOnly: true,
          origDate: startDate,
        }),
      }))
        .then(() => closeModal());
    } else {
      fetch(`/api/rides/${ride.id}`, withDefaults({ method: 'DELETE' }))
        .then(() => closeModal());
    }
  };

  const changeSelection = (e: any) => {
    setSingle(e.target.value === 'single');
  };

  return (
    <Modal
      title={'Cancel Ride'}
      isOpen={open}
      onClose={onClose}
    >
      {!ride.recurring ? (
        <div className={styles.modal}>
          <p className={styles.modalText}>Are you sure you want to cancel this ride?</p>
          <div className={styles.buttonContainer}>
            <Button type="button" onClick={confirmCancel} className={styles.redButton}> OK </Button>
          </div>
        </div>
      ) : (
        <>
          <div>
            <Input type='radio' id='single' name='rideType' value='single'
              onClick={(e) => changeSelection(e)} defaultChecked={true} />
            <Label htmlFor="single" className={styles.modalText}>This Ride Only</Label>
          </div>
          <div>
            <Input type='radio' id='recurring' name='rideType' value='recurring'
              onClick={(e) => changeSelection(e)} />
            <Label htmlFor="recurring" className={styles.modalText}>All Recurring Rides</Label>
          </div>
          <div className={styles.buttonContainer}>
            <Button type="submit" onClick={confirmCancel} className={styles.redButton}> OK </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default DeleteRideModal;
