import React, { useState } from 'react';
import Modal from './Modal';
import { Ride } from '../../types/index';
import { Button, Input, Label } from '../FormElements/FormElements';
import styles from './editOrDeleteModals.module.css';

type EditTypeModalProps = {
  open: boolean,
  ride: Ride,
  onClose: () => void,
  onNext: (single: boolean) => void;
}

const EditTypeModal = ({ open, ride, onClose, onNext }: EditTypeModalProps) => {
  const [single, setSingle] = useState(true);

  const changeSelection = (e: any) => {
    setSingle(e.target.value === 'single');
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title='Edit Ride'
    >
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
        <Button type="submit" onClick={() => {
          onClose();
          onNext(single);
        }} className={styles.blackButton}>Next</Button>
      </div>
    </Modal>
  );
};

export default EditTypeModal;
