import React, { useState, useContext, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import moment from 'moment';
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
    const [rider, setRider] = useState(undefined);
    const methods = useForm();
    const { withDefaults } = useReq();
    const {id} = useContext(AuthContext);
    const openModal = () => {
        setIsOpen(true);
        setToast(false);
      };
    
      const closeModal = () => {
        methods.clearErrors();
        setIsOpen(false);
      };
      useEffect(() => {
        fetch(`/api/riders/${id}`, withDefaults())
          .then((res) => res.json())
          .then((data) => setRider(data));
      }, [id, withDefaults]);
      const onSubmit = async (formData: ObjectType) => {
        const { startDate, recurring, whenRepeat, Mon, Tue, Wed, Thu, Fri,  
          startLocation, endLocation, pickupTime, dropoffTime, endDate, 
          customPickup, pickupCity, pickupZip, customDropoff, 
          dropoffCity, dropoffZip} = formData;
        const startTime = moment(`${startDate} ${pickupTime}`).toISOString();
        const endTime = moment(`${startDate} ${dropoffTime}`).toISOString();
        const startLoc = startLocation !== "Other"? startLocation : 
        `${customPickup},${pickupCity} NY,${pickupZip}`;
        const endLoc = endLocation !== "Other" ? endLocation : 
        `${customDropoff},${dropoffCity} NY,${dropoffZip}`;
        if(recurring){
         //Add a repeating ride
          let recurringDays:Number[] = [];
          switch(whenRepeat){
            case "daily":{
              recurringDays = [1, 2, 3, 4, 5];
              break; 
              }
            case "weekly":{
              recurringDays= [moment(`${startDate}`).toDate().getDay()]; 
              break; 
            }
            case "custom":{
              if(Number(Mon) !== -1){
                recurringDays.push(Number(Mon));
              }
              if(Number(Tue) !== -1){
                recurringDays.push(Number(Tue));
              }
              if(Number(Wed) !== -1){
                recurringDays.push(Number(Wed));
              }
              if(Number(Thu) !== -1){
                recurringDays.push(Number(Thu));
              }
              if(Number(Fri) !== -1){
                recurringDays.push(Number(Fri));
              }
              break; 
            }
            default:{
              recurringDays= [moment(`${startDate}`).toDate().getDay()]; 
              break; 
            }
          }
          const repeatingRideData: ObjectType = {
            type: 'unscheduled',
            startLocation: startLoc,
            endLocation: endLoc, 
            driver: undefined,
            rider, 
            startTime,
            endTime, 
            recurring, 
            recurringDays, 
            endDate
          };
          fetch(
            '/api/rides',
            withDefaults({
              method: 'POST',
              body: JSON.stringify(repeatingRideData),
            }),
          );
        }
        else{
          //Not repeating
          const rideData: ObjectType = {
            type: 'unscheduled',
            startLocation: startLoc,
            endLocation: endLoc, 
            driver: undefined,
            rider, 
            startTime,
            endTime,  
          };
          fetch(
            '/api/rides',
            withDefaults({
              method: 'POST',
              body: JSON.stringify(rideData),
            }),
          );
        }
        closeModal();
        setToast(true);
      };
    

      return(
          <>
            <Button onClick={openModal}>+ Request a ride</Button>
            {showingToast ? <Toast message='Your ride has been requested' /> : null}
            <Modal
                title={"Request a Ride"}
                isOpen={isOpen}
                onClose={closeModal}
            >
               <FormProvider {...methods} >
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div className={styles.inputContainer}>
            <RequestRideInfo/>
            <Button className={styles.submit} type='submit'>
              Request a Ride
            </Button>
            </div>
          </form>
        </FormProvider>
            </Modal>
          </>
      );
};
export default RequestRideModal;