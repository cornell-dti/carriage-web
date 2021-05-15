import React, { useState, useContext } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import moment from 'moment';
import AuthContext from '../../context/auth';
import { useReq } from '../../context/req';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType, Rider } from '../../types/index';
import Toast from '../ConfirmationToast/ConfirmationToast';
import styles from './requestridemodal.module.css';
import RequestRideInfo from './RequestRideInfo';

const daysToNumber = {
  Mon: 1,
  Tue: 2, 
  Wed: 3,
  Thu: 4, 
  Fri: 5
};
const RequestRideModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showingToast, setToast] = useState(false);
    const methods = useForm();
    const { withDefaults } = useReq();
    const authContext = useContext(AuthContext);
    const openModal = () => {
        setIsOpen(true);
        setToast(false);
      };
    
      const closeModal = () => {
        methods.clearErrors();
        setIsOpen(false);
      };

      const onSubmit = async (formData: ObjectType) => {
        const { startDate, repeating, whenRepeat, days,  
          startLocation, endLocation, startTime, endTime, endDate } = formData;
        const {id} = authContext; 
        const rider: Rider = await fetch(`/api/riders/${id}`, withDefaults())
        .then((res) => res.json())
        .then((data) => data.data); 
        const pickupTime = moment(`${startDate} ${startTime}`).toISOString();
        const dropoffTime = moment(`${startDate} ${endTime}`).toISOString();
        if(repeating){
         //Add a repeating ride
          let finDays:Number[] = [];
          switch(whenRepeat){
            case "daily":{
              finDays = [1, 2, 3, 4, 5];
              break; 
              }
            case "weekly":{
              finDays= [moment(`${startDate}`).toDate().getDay()]; 
              break; 
            }
            case "custom":{
              days.forEach((day:string) =>  finDays.push(Number(day)));
              break; 
            }
            default:{
              finDays= [moment(`${startDate}`).toDate().getDay()]; 
              break; 
            }
          }
          const repeatingRideData: ObjectType = {
            pickupTime,
            dropoffTime, 
            rider, 
            startLocation,
            endLocation, 
            repeating, 
            finDays, 
            endDate
          };
          // fetch(
          //   '/api/rides',
          //   withDefaults({
          //     method: 'POST',
          //     body: JSON.stringify(repeatingRideData),
          //   }),
          // );
          console.log(repeatingRideData);
        }
        else{
          //Not repeating
          const rideData: ObjectType = {
            pickupTime,
            dropoffTime,
            rider,
            startLocation,
            endLocation,
          };
          // fetch(
          //   '/api/rides',
          //   withDefaults({
          //     method: 'POST',
          //     body: JSON.stringify(rideData),
          //   }),
          // );
          console.log(rideData);
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