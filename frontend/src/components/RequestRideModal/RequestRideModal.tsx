import React, { useState, useContext } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import AuthContext from '../../context/auth';
import { useReq } from '../../context/req';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType } from '../../types/index';
import Toast from '../ConfirmationToast/ConfirmationToast';
import styles from './requestridemodal.module.css';
import RequestRideInfo from './RequestRideInfo';

const RequestRideModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showingToast, setToast] = useState(false);
    const methods = useForm();
    const authContext = useContext(AuthContext);
    const openModal = () => {
        setIsOpen(true);
        setToast(false);
      };
    
      const closeModal = () => {
        methods.clearErrors();
        setIsOpen(false);
      };

      const onSubmit = async (data: ObjectType) => {
        const { startLocation, endLocation, startTime, endTime, 
          recurringDays, startDate, endDate } = data;
        const {id} = authContext; 
        closeModal();
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
               <FormProvider {...methods} >
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <RequestRideInfo/>
            <Button className={styles.submit} type='submit'>
              Request a Ride
            </Button>
          </form>
        </FormProvider>
            </Modal>
          </>
      );
};
export default RequestRideModal;