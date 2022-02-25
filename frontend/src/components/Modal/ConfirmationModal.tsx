import React from 'react';
import Modal from './Modal';
import { Button } from '../FormElements/FormElements';
import { useReq } from '../../context/req';
import styles from './confirmModal.module.css';
import { useRiders } from '../../context/RidersContext';

import { Rider } from '../../types/index';
import { useHistory } from 'react-router-dom';

type ConfirmationProps = {
  open: boolean;
  rider?: Rider | undefined;
  onClose: () => void;
};

const ConfirmationModal = ({ open, rider, onClose }: ConfirmationProps) => {
  const { refreshRiders } = useRiders();
  const { withDefaults } = useReq();
  const history = useHistory();

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
        closeModal();
      });
  };

  return (
    <Modal title={''} isOpen={open} onClose={closeModal} displayClose={true}>
      <div className={styles.modal}>
        <p className={styles.modalText}>
          Are you sure you want to remove {rider?.firstName} {rider?.lastName}?
        </p>
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

//Will put the API Code here, as well as all the other code needed to create the modal
//reference the Figma for the CSS designs
