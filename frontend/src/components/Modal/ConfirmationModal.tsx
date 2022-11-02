import React, { useState } from 'react';
import Modal from './Modal';
import { Button } from '../FormElements/FormElements';
import { useReq } from '../../context/req';
import styles from './confirmModal.module.css';
import { useRiders } from '../../context/RidersContext';
import { Rider } from '../../types/index';
import { useHistory } from 'react-router-dom';
import { ToastStatus, useToast } from '../../context/toastContext';

type ConfirmationProps = {
  open: boolean;
  rider?: Rider | undefined;
  onClose: () => void;
};

const ConfirmationModal = ({ open, rider, onClose }: ConfirmationProps) => {
  const { refreshRiders } = useRiders();
  const { withDefaults } = useReq();
  const history = useHistory();
  const { showToast } = useToast(); // do this

  const closeModal = () => {
    onClose();
  };

  const studentDelete = () => {
    fetch(
      `/api/riders/${!rider ? '' : rider.id}`,
      withDefaults({
        method: 'DELETE',
      })
    )
      .then(refreshRiders)
      .then(() => {
        history.push('/riders');
        showToast('The student has been deleted.', ToastStatus.SUCCESS);
        closeModal();
      });
  };

  const modalText = `Are you sure you want to remove ${rider?.firstName} ${rider?.lastName}?`;
  return (
    <Modal
      title={''}
      label={'test label'}
      isOpen={open}
      onClose={closeModal}
      displayClose={true}
    >
      <div className={styles.modal}>
        <p className={styles.modalText}>{modalText}</p>
        <div className={styles.buttonContainer}>
          <Button
            type="button"
            onClick={closeModal}
            className={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={studentDelete}
            className={styles.removeButton}
          >
            Remove
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
