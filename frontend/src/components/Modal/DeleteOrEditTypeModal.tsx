import React, { useState } from 'react';
import Modal from './Modal';
import { Ride } from '../../types/index';
import { Button, Input, Label } from '../FormElements/FormElements';
import styles from './deleteOrEditModal.module.css';
import { format_date } from '../../util/index';
import { ToastStatus, useToast } from '../../context/toastContext';
import { useRides } from '../../context/RidesContext';
import axios from '../../util/axios';
import { useDate } from '../../context/date';


type DeleteOrEditTypeModalProps = {
  open: boolean;
  ride: Ride;
  onClose: () => void;
  deleting: boolean;
  onNext?: (single: boolean) => void;
  isRider?: boolean;
};

const DeleteOrEditTypeModal = ({
  open,
  ride,
  onClose,
  deleting,
  onNext,
  isRider,
}: DeleteOrEditTypeModalProps) => {
  const [single, setSingle] = useState(true);
  const [allOrFollowing, setAllOrFollowing] = useState(true); // true means for all.
  const { showToast } = useToast();
  const { refreshRides } = useRides();

  const closeModal = () => {
    onClose();
    setSingle(true);
  };
  const {curDate} = useDate();

  //delete logic for normal rides and recurring rides (delete single, all, or from this ride and all following rides)
  const confirmCancel = () => {
    if (ride.recurring) {
      //Need to fix the logic for this
      if (single) {
        /**
         * trim end date of immediate parent to before this day.
         * delete all children rides of the immediate parent.
         * create a new ride on the date + 1 with data similar to parent if the parent’s original endTime allow for it. Add the id of the parent ride as the id of this ride’s parentId.
         * add childrenId to parent ride.
        */
        const parentOriginalEndDate = new Date(ride.immediateParentRide!.endDate!);

        let trimmedEndDateImmPar = curDate;
        trimmedEndDateImmPar.setDate(trimmedEndDateImmPar.getDate() - 1);

        axios.put(`/api/rides/${ride.immediateParentRideId}`, {...ride.immediateParentRide, endDate : trimmedEndDateImmPar.toISOString()});
        let currentRide = (ride.immediateParentRide)!.children;
        while (currentRide !== undefined) {
          axios
          .delete(`/api/rides/${currentRide.id}`);
          currentRide = currentRide.children;
        }
        
        if (parentOriginalEndDate > curDate) {
          let newChildRideStartTime = new Date(ride.startTime)
          newChildRideStartTime.setDate(newChildRideStartTime.getDate() + 1);
          let {id, ...rideNoId} = ride;
          const newChildRide = {
            ...rideNoId, 
            startTime : newChildRideStartTime,
            endDate : parentOriginalEndDate.toISOString(), 
            type : 
            'unscheduled'
          }
          axios
            .post('/api/rides', newChildRide)
            .then((response) => response.data)
            .then((rideData) => 
              axios.put(`/api/rides/${ride.immediateParentRideId}`, {...ride.immediateParentRide, children : rideData, childrenId: rideData.id})
          );
          closeModal();
          refreshRides();
        }
      } else {
        if (allOrFollowing) {
          /**
          * 1. go to source ride, delete itself all children rides
          * 2. refreshRides
          */
          let currentRide = ride.sourceRide;
          while (currentRide !== undefined) {
            axios
            .delete(`/api/rides/${currentRide.id}`)
            currentRide = currentRide.children;
          }
          closeModal();
          refreshRides();
        } else {
          /**
           * go to parent ride, trim enddate to before today, delete all children rides (not including itself)
           * refreshRides
           */
          let trimmedEndDateImmPar = curDate;
          trimmedEndDateImmPar.setDate(trimmedEndDateImmPar.getDate() - 1);
          axios.put(`/api/rides/${ride.immediateParentRideId}`, {...ride.immediateParentRide, endDate : trimmedEndDateImmPar.toISOString()});
          
          let currentRide = (ride.immediateParentRide)!.children;
          while (currentRide !== undefined) {
            axios
            .delete(`/api/rides/${currentRide.id}`);
            currentRide = currentRide.children;
          }
          closeModal();
          refreshRides();
        }
      }
    } else {
      // console.log("hellow, del", ride!.id);
      axios
        .delete(`/api/rides/${ride.id}`)
        .then(() => closeModal())
        .then(refreshRides);
    }
    showToast(
      ride.recurring && !single ? 'Rides Cancelled' : 'Ride Cancelled',
      ToastStatus.SUCCESS
    );
  };

  const changeSelection = (e: any) => {
    setSingle(e.target.value === 'single');
  };

  //bruh the fuck is onnext?
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
      title={
        !isRider && !ride.recurring
          ? ''
          : deleting
          ? ride.recurring
            ? 'Cancel Recurring Ride'
            : 'Cancel Ride'
          : 'Edit Repeating Ride'
      }
      isOpen={open}
      onClose={closeModal}
      isRider={isRider}
    >
      {deleting && !ride.recurring ? (
        <div className={styles.modal}>
          <p className={styles.modalText}>
            Are you sure you want to cancel this ride?
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
              id="allRecurring"
              name="rideType"
              value="allRecurring"
              onClick={(e) => {changeSelection(e); setAllOrFollowing(true)}}
            />
            <Label htmlFor="allRecurring" className={styles.modalText}>
              All Repeating Rides
            </Label>
          </div>
          <div>
            <Input
              type="radio"
              id="followingRecurring"
              name="rideType"
              value="followingRecurring"
              onClick={(e) => {changeSelection(e); setAllOrFollowing(false)}}
            />
            <Label htmlFor="followingRecurring" className={styles.modalText}>
              This and Following Rides.
            </Label>
          </div>
          <div className={styles.buttonContainer}>
            <Button outline type="button" onClick={closeModal}>
              Back
            </Button>
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
