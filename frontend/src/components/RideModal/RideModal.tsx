import React, { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import Modal from '../Modal/Modal';
import { Input, Label, Button } from '../FormElements/FormElements';
import { DriverPage, RiderInfoPage, RideTimesPage } from './Pages';
import { ObjectType, RepeatValues, Ride, Type } from '../../types/index';
import { format_date } from '../../util/index';
import { useRides } from '../../context/RidesContext';
import { useDate } from '../../context/date';
import { ToastStatus, useToast } from '../../context/toastContext';
import axios from '../../util/axios';
import { format } from 'crypto-js';

type RideModalProps = {
  open?: boolean;
  close?: () => void;
  ride?: Ride;
};

enum EditAddRideType {
  SINGLE,
  ALL,
  THIS_AND_FOLLOWING,
}

const getRideData = (ride: Ride | undefined) => {
  if (ride) {
    let rideData: ObjectType = {
      date: format_date(ride.startTime),
      pickupTime: moment(ride.startTime).format('kk:mm'),
      dropoffTime: moment(ride.endTime).format('kk:mm'),
      rider: `${ride.rider.firstName} ${ride.rider.lastName}`,
      pickupLoc: ride.startLocation.id
        ? ride.startLocation.name
        : ride.startLocation.address,
      dropoffLoc: ride.endLocation.id
        ? ride.endLocation.name
        : ride.endLocation.address,
      
    };
    if (ride.recurring) {
      let repeats;
      let days;
      const startDay = moment(ride.startTime).weekday();

      if (ride.recurringDays!.length === 5) {
        repeats = RepeatValues.Daily;
      } else if (
        ride.recurringDays!.length === 1 &&
        ride.recurringDays![0] === startDay
      ) {
        repeats = RepeatValues.Weekly;
      } else {
        repeats = RepeatValues.Custom;
        const numToDay = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        days = ride.recurringDays!.reduce((prev, curr) => {
          return { ...prev, [numToDay[curr]]: '1' };
        }, {} as ObjectType);
      }

      rideData = {
        ...rideData,
        repeats,
        days,
        endDate: (ride.endDate),
        parentRideId : ride.parentRideId, 
        sourceRideId : ride.sourceRide, 
        childRideId : ride.childRideId
      };
    }
    return rideData;
  }
  return {};
};

type EditRecurringProps = {
  onSubmit: (recurring: EditAddRideType) => void;
};

const EditRecurring = ({ onSubmit }: EditRecurringProps) => {
  const [editAddType, setEditAddType] = useState(EditAddRideType.SINGLE);

  return (
    <>
      <div>
        <Input
          type="radio"
          id="single"
          name="rideType"
          value="single"
          onClick={(e) => {
            setEditAddType(EditAddRideType.SINGLE);
          }}
          defaultChecked={true}
        />
        <Label htmlFor="single">This Ride Only</Label>
      </div>
      <div>
        <Input
          type="radio"
          id="allRecurring"
          name="rideType"
          value="allRecurring"
          onClick={(e) => {
            setEditAddType(EditAddRideType.ALL);
          }}
        />
        <Label htmlFor="allRecurring">All Repeating Rides</Label>
      </div>
      <div>
        <Input
          type="radio"
          id="followingRecurring"
          name="rideType"
          value="followingRecurring"
          onClick={(e) => {
            setEditAddType(EditAddRideType.THIS_AND_FOLLOWING);
          }}
        />
        <Label htmlFor="followingRecurring">This and Following Rides.</Label>
      </div>
      <div>
        <Button
          type="submit"
          onClick={() => {
            onSubmit(editAddType);
          }}
        >
          {'OK'}
        </Button>
      </div>
    </>
  );
};

const RideModal = ({ open, close, ride }: RideModalProps) => {
  const originalRideData = getRideData(ride);
  const [formData, setFormData] = useState<ObjectType>(originalRideData);
  const [isOpen, setIsOpen] = useState(open !== undefined ? open : false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [editAddType, setEditAddType] = useState(EditAddRideType.SINGLE);
  const {curDate} = useDate();
  console.log(curDate);

  const { showToast } = useToast();
  const { refreshRides } = useRides();
  const [showRest, setShowRest] = useState(false);

  const goNextPage = () => setCurrentPage((p) => p + 1);

  const goPrevPage = () => setCurrentPage((p) => p - 1);

  const openModal = () => {
    setCurrentPage(0);
    setIsOpen(true);
  };

  const closeModal = useCallback(() => {
    if (close) {
      setFormData(originalRideData);
      close();
    } else {
      setFormData({});
    }
    setCurrentPage(0);
    setIsOpen(false);
  }, [close, originalRideData]);

  const saveDataThen = (next: () => void) => (data: ObjectType) => {
    setFormData((prev) => ({ ...prev, ...data }));
    next();
  };

  const submitData = () => setIsSubmitted(true);

  const getRecurringDays = (
    date: string,
    repeats: RepeatValues,
    days: ObjectType
  ): number[] => {
    switch (repeats) {
      case RepeatValues.Daily:
        return [1, 2, 3, 4, 5];
      case RepeatValues.Weekly:
        return [moment(date).weekday()];
      default: {
        const dayToNum: ObjectType = {
          Mon: 1,
          Tue: 2,
          Wed: 3,
          Thu: 4,
          Fri: 5,
        };
        return Object.keys(days)
          .filter((day) => days[day] !== '')
          .map((day) => dayToNum[day]);
      }
    }
  };

  useEffect(() => {
    if (isSubmitted) {
      const {
        date,
        pickupTime,
        dropoffTime,
        repeats,
        endDate,
        days,
        driver,
        rider,
        startLocation,
        endLocation,
      } = formData;

      const startTime = moment(`${date} ${pickupTime}`).toISOString();
      const endTime = moment(`${date} ${dropoffTime}`).toISOString();
      const hasDriver = Boolean(driver) && driver !== 'None';

      //in the case of recurring rides, 
      //rideData should also have 
      // 1. recurring = true
      // 2. recurringDays
      // 3. endDate
      
      console.log("start end time", startTime, endTime);

      let rideData: ObjectType = {
        type: hasDriver ? 'active' : 'unscheduled',
        startTime,
        endTime,
        driver: hasDriver ? driver : undefined,
        rider,
        startLocation, // id to location entry in dynamo table
        endLocation, // id to location entry in dynamo table
      };
      

      //if the ride repeats
      if (repeats !== RepeatValues.DoesNotRepeat) {
        rideData = {
          ...rideData,
          recurring: true,
          recurringDays: getRecurringDays(date, repeats, days),
          endDate: (endDate),
        };
      }


      //shittttt, the new form data is in formData, should use that to get latest data about ride.
      if (ride) {
        // scheduled ride
        if (ride.type === 'active') {
          rideData.type = 'unscheduled';
        }
        if (ride.recurring) {
          if (editAddType == EditAddRideType.ALL) {
            //need to show them the data of the sourceRide to edit.
            //have to ask desmond
            /**
             * go up the chain to the ancestor ride
             * delete all children by going down the linked list 
             * apply edit to the ancestor. 
             */
            let currentRide = ride.sourceRide;
            while (currentRide?.parentRide !== undefined) {
              currentRide = currentRide.parentRide;
            }
            //now currentRides is at the beginning of linked list
            currentRide = currentRide?.childRide;
            while (currentRide !== undefined) {
              axios.delete(`/api/rides/${currentRide.id}`);
              currentRide = currentRide.childRide;
            }
            //now all elements except the beginning has been deleted.

            axios
              .put(`/api/rides/${ride.id}`, rideData)
              .then(refreshRides);
          } else if (editAddType == EditAddRideType.THIS_AND_FOLLOWING) {
            //need to show them the data of the current ride, so don't need to change anything.
            
            // lock the start date (date)
            // trim the date of this ride, axios.put
            // create a new ride, do whatever, can be a single non repeating ride.
            // should not link back to parent (gcal does this)
            
            
            //delete ride if enddate is before startdate. also have to axios put children's parent to undefined.
            let trimmedEndDateImmPar = new Date(startTime);
            trimmedEndDateImmPar.setDate(trimmedEndDateImmPar.getDate() - 1);
            trimmedEndDateImmPar.setHours(0, 0, 0);

            let sourceRideStartDate = new Date(ride.sourceRide!.startTime);
            sourceRideStartDate.setHours(0, 0, 0);

            if (trimmedEndDateImmPar >= sourceRideStartDate) {
              ride.sourceRide! = {...ride.sourceRide!, endDate: format_date(trimmedEndDateImmPar.toISOString())}
              
              console.log(ride.sourceRide!);
              axios.put(`/api/rides/${ride.id}`, {
                type : 'unscheduled', 
                startTime : ride.sourceRide!.startTime,
                endTime : ride.sourceRide!.endTime, 
                driver : undefined, 
                rider : ride.sourceRide.rider, 
                startLocation : ride.sourceRide!.startLocation.id,
                endLocation : ride.sourceRide!.endLocation.id,
                parentRideId : ride!.parentRideId, 
                childRideId : ride!.childRideId,
                recurring : true,
                recurringDays : ride!.sourceRide!.recurringDays!, 
                endDate : format_date(ride!.sourceRide.endDate!)
              });

            } else {
              axios.delete(`/api/rides/${ride.id}`)
            }
            

            //delete all descendants ride of sourceRide.
            let currentRide = ride.sourceRide?.childRide;
            while (currentRide !== undefined) {
              axios.delete(`/api/rides/${currentRide.id}`);
              currentRide = currentRide.childRide;
            }
            //now we create a new ride starting from today to with the data in formData, but have it doesn't link back
            rideData = {
              ...rideData, 
              parentRideId : undefined, 
              childRideId : undefined
            }

            axios
              .post(`/api/rides`, rideData)
              .then((response) => response.data)
              .then(refreshRides);
          } else { 

            // Note: lock the day and recurring (recurring must be true).
            // trim its end date: change its end date then axios put with id and with sourceRide end date changed.
            // Create a new ride on that day, have the ride above as its parent and parentId, axios.post. Also axios put the parent ride above to have children as this new ride.
            // After this, add another recurring ride with the original ride end date and information (if the end date is larger than today).
            // Link this ride to the single non recurring ride you just created: axios put appropriate parent and children field.
            const originalEndDate = new Date(ride.sourceRide!.endDate!);
            console.log("og end date", originalEndDate);
            let trimmedEndDateImmPar = new Date(startTime);
            trimmedEndDateImmPar.setDate(trimmedEndDateImmPar.getDate() - 1);
            trimmedEndDateImmPar.setHours(0, 0, 0);

            let sourceRideStartDate = new Date(ride.sourceRide!.startTime);
            sourceRideStartDate.setHours(0, 0, 0);
            let deletedSourceRide = false;


            if (trimmedEndDateImmPar >= sourceRideStartDate) {
              console.log("trimmed end date is", trimmedEndDateImmPar, sourceRideStartDate, trimmedEndDateImmPar.toISOString());
              //updates the source ride.
              ride.sourceRide! = {...ride.sourceRide!, endDate: format_date(trimmedEndDateImmPar.toISOString())}
              console.log(ride.sourceRide!);
              axios.put(`/api/rides/${ride.id}`, {
                type : ride.sourceRide!.type, 
                startTime : ride.sourceRide!.startTime,
                endTime : ride.sourceRide!.endTime, 
                driver : ride.sourceRide!.driver, 
                rider : ride.sourceRide!.rider, 
                startLocation : ride.sourceRide!.startLocation.id,
                endLocation : ride.sourceRide!.endLocation.id,
                parentRideId : ride!.parentRideId, 
                childRideId : ride!.childRideId,
                recurring : true,
                recurringDays : ride!.sourceRide!.recurringDays!, 
                endDate : ride!.sourceRide.endDate!
              });
            } else {
              axios.delete(`/api/rides/${ride.id}`)
              deletedSourceRide = true;
            }

            let singleRideEndDate = new Date(startTime);
            singleRideEndDate.setHours(0, 0, 0);

            rideData = {
              ...rideData, 
              parentRideId : deletedSourceRide ? undefined: ride.id, 
              childRideId : undefined, 
              recurring : true, 
              recurringDays: [1, 2, 3, 4, 5], 
              endDate : format_date(singleRideEndDate),
              driver : ride.sourceRide?.driver 
            };


            //here, we need to add new ride (non recurring ride) to database axios.post
            //then we need to update its parent ride's children ride field axios.put (if the parent ride still exists)
            //then we need to create a new recurring ride with the parent rides's same data axios.post (if the end date of the parent is > than the current date)
            


            //TODO : NEED TO FIX CHILDRIDEID 
            console.log(originalEndDate, curDate);
            axios
              .post(`/api/rides/`, rideData)
              .then((response) => response.data)
              .then((newSingleRideData : Ride) => {
                if (!deletedSourceRide) {
                  ride.sourceRide! = {
                    ...ride.sourceRide!, 
                    childRideId : newSingleRideData.id, 
                    childRide : newSingleRideData
                  }
                  axios.put(`/api/rides/${ride.id}`, {
                    type : ride.sourceRide!.type, 
                    startTime : ride.sourceRide!.startTime,
                    endTime : ride.sourceRide!.endTime, 
                    driver : ride.sourceRide!.driver, 
                    rider : ride.sourceRide!.rider, 
                    startLocation : ride.sourceRide!.startLocation.id,
                    endLocation : ride.sourceRide!.endLocation.id,
                    parentRideId : ride!.parentRideId, 
                    childRideId : ride!.childRideId,
                    recurring : true,
                    recurringDays : ride!.sourceRide!.recurringDays!, 
                    endDate : (format_date(ride!.sourceRide.endDate!))
                  });

                }
                let today = new Date(startTime);
                today.setHours(0, 0, 0);
                if (originalEndDate > today) {
                  //create a new recurring ride with same data as the old one but with start date = curDate + 1.
                  let newRideStartTime = new Date(ride.sourceRide!.startTime);
                  newRideStartTime.setDate(today.getDate() + 1);
                  let newRideEndTime = new Date(ride.sourceRide!.endTime);
                  newRideEndTime.setDate(today.getDate() + 1);
                  console.log("current date", today);
                  console.log("newRideStartTime, newRideEndTime", newRideStartTime, newRideEndTime);
                  const newRecurringRideData : Ride = {
                    ...ride.sourceRide!, 
                    startTime : newRideStartTime.toISOString(),
                    endTime : newRideEndTime.toISOString(),
                    endDate : format_date(originalEndDate), 
                    parentRideId : newSingleRideData.id,
                    childRideId: ride.sourceRide!.childRideId, 
                    recurring : true,
                    type : Type.UNSCHEDULED
                  };
                  
                  axios.post(`/api/rides/`, {
                    type : newRecurringRideData.type, 
                    startTime : newRecurringRideData.startTime,
                    endTime : newRecurringRideData.endTime, 
                    driver : newRecurringRideData.driver, 
                    rider : newRecurringRideData.rider, 
                    startLocation : newRecurringRideData.startLocation.id,
                    endLocation : newRecurringRideData.endLocation.id,
                    parentRideId : newRecurringRideData.parentRideId, 
                    childRideId : newRecurringRideData.childRideId,
                    recurring : true,
                    recurringDays : newRecurringRideData.recurringDays!, 
                    endDate : format_date(newRecurringRideData.endDate)
                  });
                } else {

                }
              });
          }
        } else {
          axios.put(`/api/rides/${ride.id}`, rideData).then(refreshRides);
        }
      } else {
        // unscheduled ride
        axios.post('/api/rides', rideData).then(refreshRides);
      }

      setIsSubmitted(false);
      closeModal();
      showToast(ride ? 'Ride edited.' : 'Ride added.', ToastStatus.SUCCESS);
    }
  }, [
    closeModal,
    formData,
    isSubmitted,
    ride,
    editAddType,
    refreshRides,
    showToast,
  ]);

  return ride ? (
    ride.recurring ? (
      <>
        {true && (
          <Modal
            paginate
            title={['Edit Repeating Ride', 'Edit Ride', 'Edit Ride']}
            isOpen={open || isOpen}
            currentPage={currentPage}
            onClose={closeModal}
          >
            <EditRecurring
              onSubmit={(e) => {
                setEditAddType(e);
                goNextPage();
              }}
            />
            <RideTimesPage
              defaultRepeating={ride.recurring}
              formData={formData}
              onSubmit={saveDataThen(goNextPage)}
            />
            <RiderInfoPage
              formData={formData}
              onBack={goPrevPage}
              onSubmit={saveDataThen(submitData)}
            />
          </Modal>
        )}
      </>
    ) : (
      <>
        <Modal
          paginate
          title={['Edit Ride', 'Edit Ride']}
          isOpen={open || isOpen}
          currentPage={currentPage}
          onClose={closeModal}
        >
          <RideTimesPage
            defaultRepeating={ride.recurring}
            formData={formData}
            onSubmit={saveDataThen(goNextPage)}
          />
          <RiderInfoPage
            formData={formData}
            onBack={goPrevPage}
            onSubmit={saveDataThen(submitData)}
          />
        </Modal>
      </>
    )
  ) : (
    <>
      {!open && <Button onClick={openModal}>+ Add ride</Button>}
      <Modal
        paginate
        title={['Add a Ride', 'Available Drivers', 'Add a Ride']}
        isOpen={isOpen}
        currentPage={currentPage}
        onClose={closeModal}
        id="ride-modal"
      >
        <RideTimesPage
          formData={formData}
          onSubmit={saveDataThen(goNextPage)}
        />
        <DriverPage
          formData={formData}
          onBack={goPrevPage}
          onSubmit={saveDataThen(goNextPage)}
          labelid="ride-modal"
        />
        <RiderInfoPage
          formData={formData}
          onBack={goPrevPage}
          onSubmit={saveDataThen(submitData)}
        />
      </Modal>
    </>
  );
};

export default RideModal;
