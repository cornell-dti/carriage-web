import React from 'react';
import Modal from './Modal';
import { Button } from '../FormElements/FormElements';
import styles from './modal.module.css';
import { RideType } from '@carriage-web/shared/src/types/ride';
import { useToast, ToastStatus } from '../../context/toastContext';
import axios from '../../util/axios';

type DeleteOrEditTypeModalProps = {
  open: boolean;
  onClose: () => void;
  onNext?: (single: boolean) => void;
  deleting?: boolean;
  ride: RideType;
  refreshRides?: () => void;
  isRider?: boolean;
};

const DeleteOrEditTypeModal = ({
  open,
  onClose,
  deleting = false,
  ride,
  refreshRides = () => {},
  isRider = false,
}: DeleteOrEditTypeModalProps) => {
  const { showToast } = useToast();

  const closeModal = () => {
    onClose();
  };

  const confirmCancel = () => {
    // For now, recurring rides are not supported, so just delete normally
    if (ride.isRecurring) {
      showToast('Recurring ride deletion not supported yet', ToastStatus.ERROR);
      return;
    }

    axios
      .delete(`/api/rides/${ride.id}`)
      .then(() => {
        closeModal();
        refreshRides();
        showToast('Ride Cancelled', ToastStatus.SUCCESS);
      })
      .catch(() => {
        showToast('Failed to cancel ride', ToastStatus.ERROR);
      });
  };

  return (
    <Modal
      title="Cancel Ride"
      isOpen={open}
      onClose={closeModal}
      isRider={isRider}
    >
      <div className={styles.modal}>
        <p className={styles.modalText}>
          Are you sure you want to cancel this ride?
          {ride.isRecurring && (
            <span
              style={{
                color: 'red',
                display: 'block',
                marginTop: '10px',
                fontSize: '0.9em',
              }}
            >
              Note: Recurring ride features are not yet supported.
            </span>
          )}
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
    </Modal>
  );
};

export default DeleteOrEditTypeModal;
