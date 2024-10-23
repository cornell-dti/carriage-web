import React, { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import Modal from '../Modal/Modal';
import { Input, Label, Button } from '../FormElements/FormElements';
import { DriverPage, RiderInfoPage, RideTimesPage } from './Pages';
import { ObjectType, RepeatValues, Ride } from '../../types/index';
import { format_date } from '../../util/index';
import { useRides } from '../../context/RidesContext';
import { ToastStatus, useToast } from '../../context/toastContext';
import axios from '../../util/axios';
import DeleteOrEditTypeModal from 'components/Modal/DeleteOrEditTypeModal';
import { isOutOfBounds } from 'react-datepicker/dist/date_utils';

type RideModalProps = {
  open?: boolean;
  close?: () => void;
  ride?: Ride;
};

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
      };
    }
    return rideData;
  }
  return {};
};

type EditRecurringProps = {
  onSubmit: (recurring : boolean) => void;
};

const EditRecurring = ({ onSubmit }: EditRecurringProps) => {
  const [single, setSingle] = useState(true);
  const changeSelection = (e: any) => {
    setSingle(e.target.value === 'single');
  };
  return (
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
        <Label htmlFor="single">
          This Ride Only
        </Label>
      </div>
      <div>
        <Input
          type="radio"
          id="recurring"
          name="rideType"
          value="recurring"
          onClick={(e) => changeSelection(e)}
        />
        <Label htmlFor="recurring">
          All Repeating Rides
        </Label>
      </div>
      <div>
        <Button
          type="submit"
          onClick={() => {onSubmit(single)}}
        >
          {"OK"}
        </Button>
      </div>
    </>
  );
};

//need to add option to this to select whether to editsingle or not, shoulnd't be a prop passed in
const RideModal = ({ open, close, ride }: RideModalProps) => {
  const originalRideData = getRideData(ride);
  const [formData, setFormData] = useState<ObjectType>(originalRideData);
  const [isOpen, setIsOpen] = useState(open !== undefined ? open : false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [editSingle, setEditSingle] = useState(true);
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
      };

      if (repeats !== RepeatValues.DoesNotRepeat) {
        rideData = {
          ...rideData,
          recurring: true,
          recurringDays: getRecurringDays(date, repeats, days),
          endDate: format_date(endDate),
        };
      }

      if (ride) {
        // scheduled ride
        if (ride.type === 'active') {
          rideData.type = 'unscheduled';
        }
        if (editSingle) {
          const daysWithEdits: string[] =
            ride!.parentRide!.edits === undefined
              ? []
              : ride!.parentRide!.edits;
          daysWithEdits.push(new Date(ride.startTime).toISOString());
          axios
            .put(`/api/rides/${ride!.parentRide!.id!}`, {
              edits: daysWithEdits,
            })
            .then(refreshRides);
          // create new ride with no relation to parent ride
          rideData = { ...rideData, parentRide: undefined };
          axios.post('/api/rides', rideData).then(refreshRides);
        } else {
          // edit ride or all instances of repeating ride
          axios.put(`/api/rides/${ride!.parentRide!.id}`, rideData).then(refreshRides);
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
    editSingle,
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
            <EditRecurring onSubmit={(recurring) => {setEditSingle(recurring); goNextPage()}}/>
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
