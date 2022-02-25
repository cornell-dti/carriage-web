import React, { useState } from 'react';
import Modal from './Modal';
import { Ride } from '../../types/index';
import { Button, Input, Label } from '../FormElements/FormElements';
import { useReq } from '../../context/req';
import styles from './deleteOrEditModal.module.css';
import { format_date } from '../../util/index';

type DeleteOrEditTypeModalProps = {
  open: boolean;
  ride: Ride;
  onClose: () => void;
  deleting: boolean;
  onNext?: (single: boolean) => void;
};

const DeleteOrEditTypeModal = ({
  open,
  ride,
  onClose,
  deleting,
  onNext,
}: DeleteOrEditTypeModalProps) => {
  const [single, setSingle] = useState(true);
  const { withDefaults } = useReq();

  const closeModal = () => {
    onClose();
    setSingle(true);
  };

  const confirmCancel = () => {
    if (ride.recurring && single) {
      const startDate = format_date(ride.startTime);
      fetch(
        `/api/rides/${ride.id}/edits`,
        withDefaults({
          method: 'PUT',
          body: JSON.stringify({
            deleteOnly: true,
            origDate: startDate,
          }),
        })
      ).then(() => closeModal());
    } else {
      fetch(`/api/rides/${ride.id}`, withDefaults({ method: 'DELETE' })).then(
        () => closeModal()
      );
    }
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
      title={deleting ? 'Cancel Ride' : 'Edit Repeating Ride'}
      isOpen={open}
      onClose={closeModal}
    >
      {deleting && !ride.recurring ? (
        <div className={styles.modal}>
          <p className={styles.modalText}>
            Are you sure you want to cancel this ride?
          </p>
          <div className={styles.buttonContainer}>
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
