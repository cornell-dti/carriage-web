import React, { useState } from 'react';
import Modal from './Modal';
import { Button } from '../FormElements/FormElements';
import { useReq } from '../../context/req';
import styles from './confirmModal.module.css';
import { useRiders } from '../../context/RidersContext';
import { Rider } from '../../types/index';
import { useHistory } from 'react-router-dom';
import { ToastStatus, useToast } from '../../context/toastContext';
import { useEmployees } from '../../context/EmployeesContext';

type ConfirmationProps = {
  open: boolean;
  rider?: Rider;
  onClose: () => void;
  employeeId?: string 
  role?: string
};

const ConfirmationModal = ({ open, rider, onClose, employeeId, role }: ConfirmationProps) => {
  const { refreshRiders } = useRiders();
  const {refreshDrivers, refreshAdmins} = useEmployees()
  const { withDefaults } = useReq();
  const history = useHistory();
  const { showToast } = useToast(); // do this

  const closeModal = () => {
    onClose();
  };

  const studentDelete = () => {
    // If admin and driver, need to update corresponding driver schema's 'admin' attribute
    if (role==='admin'){ 
      fetch(
        `/api/admins/${employeeId ? employeeId : ''}`,
        withDefaults({
          method: 'DELETE',
        })
      )
        .then(refreshAdmins)
        .then(() => {
          history.push('/admins');
          showToast('The admin has been deleted.', ToastStatus.SUCCESS);
          closeModal();
        });
    }
    else if (role==='driver'){
      fetch(
        `/api/drivers/${employeeId ? employeeId : ''}`,
        withDefaults({
          method: 'DELETE',
        })
      )
        .then(refreshDrivers)
        .then(() => {
          history.push('/drivers');
          showToast('The driver has been deleted.', ToastStatus.SUCCESS);
          closeModal();
        });
    }
    // Update both driver and admin dbs
    else if (role==='both'){
      fetch(
        `/api/drivers/${employeeId ? employeeId : ''}`,
        withDefaults({
          method: 'DELETE',
        })
      )
        .then(refreshDrivers)
        .then(refreshAdmins)
        .then(() => {
          history.push('/admins');
          showToast('The employee has been deleted.', ToastStatus.SUCCESS);
          closeModal();
        });
    }
    else {
      fetch(
        `/api/riders/${!rider ? '' : rider.id}`,
        withDefaults({
          method: 'DELETE',
        })
      )
        .then(refreshRiders)
        .then(() => {
          history.push('/riders');
          showToast('The rider has been deleted.', ToastStatus.SUCCESS);
          closeModal();
        });
    }
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
