import React, { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import Modal from '../Modal/Modal';
import { Input, Label, Button } from '../FormElements/FormElements';
import { DriverPage, RiderInfoPage, RideTimesPage } from './Pages';
import { ObjectType, RepeatValues, Ride } from '../../types/index';
import { format_date } from '../../util/index';
import { useRides } from '../../context/RidesContext';
import { useDate } from '../../context/date';
import { ToastStatus, useToast } from '../../context/toastContext';
import axios from '../../util/axios';
import DeleteOrEditTypeModal from 'components/Modal/DeleteOrEditTypeModal';
import { isOutOfBounds } from 'react-datepicker/dist/date_utils';

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
        endDate: format_date(ride.endDate),
        immediateParentRide : ride.immediateParentRide, 
        immediateParentRideId : ride.immediateParentRideId, 
        sourceRide : ride.sourceRide, 
        sourceRideId : ride.sourceRideId, 
        children: ride.children, 
        childrenId : ride.childrenId
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


  const { showToast } = useToast();
  const { refreshRides } = useRides();
  const [showRest, setShowRest] = useState(false);

  const goNextPage = () => setCurrentPage((p) => p + 1);

  const goPrevPage = () => setCurrentPage((p) => p - 1);

  const openModal = () => {
    setCurrentPage(0);
    setIsOpen(true);
  };

  // console.log("HELLO MATEW");
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
        immediateParentRide,
        immediateParentRideId,
        sourceRide, 
        sourceRideId, 
        children, 
        childrenId,
      } = formData;

      const startTime = moment(`${date} ${pickupTime}`).toISOString();
      const endTime = moment(`${date} ${dropoffTime}`).toISOString();
      const hasDriver = Boolean(driver) && driver !== 'None';

      let rideData: ObjectType = {
        type: hasDriver ? 'active' : 'unscheduled',
        startTime,
        endTime,
        driver: hasDriver ? driver : undefined,
        rider,
        startLocation,
        endLocation,
        immediateParentRide,
        immediateParentRideId,
        sourceRide, 
        sourceRideId, 
        children, 
        childrenId,
      };
      

      //if the ride repeats
      if (repeats !== RepeatValues.DoesNotRepeat) {
        rideData = {
          ...rideData,
          recurring: true,
          recurringDays: getRecurringDays(date, repeats, days),
          endDate: format_date(endDate),
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
            /**
             * Go to the source ride, delete all children ride by recursing down the children’s id.
             * apply edit to original
             */
            let currentRide = ride.sourceRide?.children;
            while (currentRide !== undefined) {
              axios.delete(`/api/rides/${currentRide.id}`);
              currentRide = currentRide.children;
            }
            axios
              .put(`/api/rides/${ride.sourceRideId}`, rideData)
              .then(refreshRides);
          } else if (editAddType == EditAddRideType.THIS_AND_FOLLOWING) {
            //ill finish this shit later bruh
            //fuckkkk in this case we would need to lock the date. 
            //here I don't think we need to lock recurring to false/true because if we edit this and following and just 
            //set it as a non recurring ride then it ends right there.
            /**
             * trim the end date of the immediate parent to before today
             * go down the tree of all children rides and delete all of them
             * create a new ride with the edited data which has the parent and parentId be the immediate parent.
             * refreshRides
             */
            let trimmedEndDateImmPar = curDate;
            trimmedEndDateImmPar.setDate(trimmedEndDateImmPar.getDate() - 1);
            axios.put(`/api/rides/${ride.immediateParentRideId}`, {
              ...ride.immediateParentRide,
              endDate: trimmedEndDateImmPar.toISOString(),
            });
            

            //delete all children ride 
            let currentRide = ride.immediateParentRide!.children;
            while (currentRide !== undefined) {
              axios.delete(`/api/rides/${currentRide.id}`);
              currentRide = currentRide.children;
            }
            //now we create a new ride starting from today to with the data in formData, but have it link back to the parent ride and the source ride.
            // we also have to update the parentRide to have this ride as its children.
            rideData = {
              ...rideData, 
              immediateParentRide : ride.immediateParentRide, 
              immediateParentRideId : ride.immediateParentRideId, 
              sourceRide : ride.sourceRide, 
              sourceRideId : ride.sourceRideId, 
              children : undefined, 
              childrenId : undefined
            }

            //adds the new ride to the database and updates the parent ride to have it as the child.
            axios
              .post(`/api/rides`, rideData)
              .then((response) => response.data)
              
              .then(data => axios.put(`/api/rides/${ride.immediateParentRideId}`, {
                ...ride.immediateParentRide,
                children: data, 
                childrenId : data.id
              }))
              .then(refreshRides);
          } else { 
            //edit single ride, meaning that we should also lock the recurring to false, can't repeat.
            //otherwise, you can do a thing where you add the new recurring ride and then another ride to continoue 
            //where that ride ended and resume with the parent ride's data. IDK yet, gotta ask desmond
            /**
             * Note: should also lock the date for simplicity.
             * trim end date of immediate parent to before this day.
             * add a new ride with the edited data on that date with immediateParent and immediateParentId being from the immediate parent.
             * The children of the immediate parent is this ride.
             * create a new recurring ride on the date + 1 with data similar to parent if the parent’s endTime allow for it. Add the id of the parent ride as the id of the newly created ride.
             * refreshRides
             */
            //dont need to lock the date.
            let trimmedEndDateImmPar = curDate;
            trimmedEndDateImmPar.setDate(trimmedEndDateImmPar.getDate() - 1); 
            axios.put(`/api/rides/${ride.immediateParentRideId}`, {
              ...ride.immediateParentRide,
              endDate: trimmedEndDateImmPar.toISOString(),
            });

            // here i create a single ride linking back to the trimmed parent ride. it is a one off ride and should not be recurring. Should prob change/remove recurring days.
            rideData = {
              ...rideData, 
              immediateParentRideId : ride.immediateParentRideId, 
              sourceRideId : ride.sourceRideId, 
              recurring : false, 
              recurringDays: undefined, 
              endDate : undefined, 
              id : undefined
            };
            axios.post(`/api/rides/`, rideData);
            
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
