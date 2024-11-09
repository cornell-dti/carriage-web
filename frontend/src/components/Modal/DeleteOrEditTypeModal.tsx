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
        * trim the end date of the ride to before today, axios.put
        * create a new recurring ride with the parent’s original end date (if that endate is > today) starting from today + 1
        * link that ride back to the parent, fill in parent and children fields. 
        */
        const originalEndDate = new Date(ride.sourceRide!.endDate!);

        let newEndDate = curDate;
        newEndDate.setDate(newEndDate.getDate() - 1);
        newEndDate.setHours(0, 0, 0);

        let sourceRideStartDate = new Date(ride.sourceRide!.startTime);
        sourceRideStartDate.setHours(0, 0, 0);
        let deletedSourceRide = false;

        if (sourceRideStartDate <= newEndDate) {
          const {id, parentRide, childRide, sourceRide, ...sourceRidewithoutRideTypes} = ride.sourceRide!;
          axios.put(`/api/rides/${ride.id}`, {...sourceRidewithoutRideTypes, endDate : newEndDate.toISOString()});
          ride.sourceRide! = {...ride.sourceRide!, endDate : newEndDate.toISOString()};
        } else {
          // if enddate is a day before the sourceRide start date then delete
          deletedSourceRide = true;
          axios.delete(`/api/rides/${ride.id}`);
        }
        
        if (originalEndDate > curDate) {
          //create a new recurring ride with same data as the old one but with start date = curDate + 1.
          let newRideStartTime = new Date(ride.sourceRide!.startTime);
          newRideStartTime.setDate(curDate.getDate() + 1);
          let newRideEndTime = new Date(ride.sourceRide!.endTime);
          newRideEndTime.setDate(curDate.getDate() + 1);
          

          let {id, ...rideNoId} = ride.sourceRide!;
          const newChildRide = {
            ...rideNoId, 
            startTime : newRideStartTime.toISOString(),
            endTime : newRideEndTime.toISOString(),
            endDate : format_date(originalEndDate), 
            parentRideId : ride.id,
            childRideId: ride.sourceRide!.childRideId, 
            recurring : true,
            type : 'unscheduled'
          }
          axios
            .post('/api/rides', newChildRide)
            .then((response) => response.data)
            .then((rideData) => {
              if (!deletedSourceRide) {  
                const {id, parentRide, childRide, sourceRide, ...sourceRidewithoutRideTypes} = ride.sourceRide!;
                axios.put(`/api/rides/${ride.id}`, {...sourceRidewithoutRideTypes, childRideId: rideData.id});
              }
              if (ride.sourceRide!.childRideId !== undefined)   {
                const {id, parentRide, childRide, sourceRide, ...childRidewithoutRideTypes} = ride.sourceRide!.childRide!;
                axios.put(`/api/rides/${ride.sourceRide!.childRide!.id}`, {...childRidewithoutRideTypes, parentRideId : rideData.id});
              }
            }
          ); 
        } 
        closeModal();
        refreshRides();
      } else {
        if (allOrFollowing) {
          /**
          * 1. Go up to find the ancestor ride and delete all descendants, including itself.
          * 2. refreshRides
          */

          //traverse to the ancestor and delete all rides along the way.
          let currentRide = ride.sourceRide;
          while (currentRide!.parentRide !== undefined) {
            currentRide = currentRide!.parentRide;
          }
          // now current ride is at the beginning of linked list
          while (currentRide !== undefined) {
            console.log("hello, deleting all, current Ride is", currentRide);
            axios.delete(`/api/rides/${currentRide.id}`);
            currentRide = currentRide.childRide;
          }

          closeModal();
          refreshRides();
        } else {
          /**
           * trim the ride’s parent date to before today, axios put
           * delete all descendants of the parent’s ride., axios delete
           */
          let newEndDate = curDate;
          newEndDate.setDate(newEndDate.getDate() - 1);
          newEndDate.setHours(0, 0, 0);

          let sourceRideStartDate = new Date(ride.sourceRide!.startTime);
          sourceRideStartDate.setHours(0, 0, 0);

          //if start date of source ride > trimmedEndate then need to delete
          if (sourceRideStartDate <= newEndDate) {
            axios.put(`/api/rides/${ride.id}`, {...ride.sourceRide, endDate : newEndDate.toISOString()});
          } else {
            axios.delete(`/api/rides/${ride.id}`)
          }
          let currentRide = ride.childRide;
          while (currentRide !== undefined) {
            axios
            .delete(`/api/rides/${currentRide.id}`);
            currentRide = currentRide.childRide;
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
