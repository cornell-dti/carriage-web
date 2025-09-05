import React, { useState } from 'react';
import Modal from './Modal';
import { Ride } from '../../types/index';
import { Button, Input, Label } from '../FormElements/FormElements';
import styles from './deleteOrEditModal.module.css';
import { format_date } from '../../util/index';
import { ToastStatus, useToast } from '../../context/toastContext';
import { useRides } from '../../context/RidesContext';
import axios from '../../util/axios';

type DeleteOrEditTypeModalProps = {
  open: boolean;
  ride: Ride;
  onClose: () => void;
  deleting: boolean;
  onNext?: (single: boolean) => void;
  isRider?: boolean;
};

const DeleteOrEditTypeModal = ({
  open,
  ride,
  onClose,
  deleting,
  onNext,
  isRider,
}: DeleteOrEditTypeModalProps) => {
  const [single, setSingle] = useState(true);
  const { showToast } = useToast();
  const { refreshRides } = useRides();

  const closeModal = () => {
    onClose();
    setSingle(true);
  };

  const confirmCancel = () => {
    if (ride.recurring && single) {
      const startDate = format_date(ride.startTime);
      axios
        .put(`/api/rides/${ride.id}/edits`, {
          deleteOnly: true,
          origDate: startDate,
        })
        .then(() => closeModal())
        .then(refreshRides);
    } else {
      axios
        .delete(`/api/rides/${ride.id}`)
        .then(() => closeModal())
        .then(refreshRides);
    }
    showToast(
      ride.recurring && !single ? 'Rides Cancelled' : 'Ride Cancelled',
      ToastStatus.SUCCESS
    );
  };

  const changeSelection = (e: any) => {
    setSingle(e.target.value === 'single');
  };

  const onButtonClick = () => {
    if (deleting) {
      confirmCancel();
    } else if (onNext) {
      onNext(single);
      setSingle(true);
    }
  };
  return (
    <Modal
      title={
        !isRider && !ride.recurring
          ? ''
          : deleting
          ? ride.recurring
            ? 'Cancel Recurring Ride'
            : 'Cancel Ride'
          : 'Edit Repeating Ride'
      }
      isOpen={open}
      onClose={closeModal}
      isRider={isRider}
    >
      {deleting && !ride.recurring ? (
        <div className={styles.modal}>
          <p className={styles.modalText}>
            Are you sure you want to cancel this ride?
          </p>
          <div className={styles.buttonContainer}>
            <Button outline type="button" onClick={closeModal}>
              Back
            </Button>
            <Button
              type="button"
              onClick={confirmCancel}
              className={styles.redButton}
            >
              OK
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div>
            <Input
              type="radio"
              id="single"
              name="rideType"
              value="single"
              onClick={(e) => changeSelection(e)}
              defaultChecked={true}
            />
            <Label htmlFor="single" className={styles.modalText}>
              This Ride Only
            </Label>
          </div>
          <div>
            <Input
              type="radio"
              id="recurring"
              name="rideType"
              value="recurring"
              onClick={(e) => changeSelection(e)}
            />
            <Label htmlFor="recurring" className={styles.modalText}>
              All Repeating Rides
            </Label>
          </div>
          <div className={styles.buttonContainer}>
            <Button disabled={true} outline type="button" onClick={closeModal}>
              Back
            </Button>

            <Button
              type="submit"
              onClick={onButtonClick}
              className={deleting ? styles.redButton : styles.blackButton}
            >
              {deleting ? 'OK' : 'Next'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default DeleteOrEditTypeModal;
