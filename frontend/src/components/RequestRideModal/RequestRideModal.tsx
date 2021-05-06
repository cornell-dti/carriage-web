import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useReq } from '../../context/req';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType } from '../../types/index';
import Toast from '../ConfirmationToast/ConfirmationToast';
import styles from './requestridemodal.module.css';

const RequestRideModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showingToast, setToast] = useState(false);
    const methods = useForm();

    const openModal = () => {
        setIsOpen(true);
        setToast(false);
      };
    
      const closeModal = () => {
        methods.clearErrors();
        setIsOpen(false);
      };

      return(
          <>
            <Button onClick={openModal}>+ Request a ride</Button>
            {showingToast ? <Toast message='The employee has been added.' /> : null}
            <Modal
                title={"Request a Ride"}
                isOpen={isOpen}
                onClose={closeModal}
            >
            </Modal>
          </>
      );
};
export default RequestRideModal;