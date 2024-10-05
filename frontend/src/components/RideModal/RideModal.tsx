import React, { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { DriverPage, RiderInfoPage, RideTimesPage } from './Pages';
import { ObjectType, RepeatValues, Ride } from '../../types/index';
import { format_date } from '../../util/index';
import { useRides } from '../../context/RidesContext';
import { ToastStatus, useToast } from '../../context/toastContext';
import axios from '../../util/axios';

type RideModalProps = {
  open?: boolean;
  close?: () => void;
  ride?: Ride;
  editSingle?: boolean;
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

const RideModal = ({ open, close, ride, editSingle }: RideModalProps) => {
  const originalRideData = getRideData(ride);
  const [formData, setFormData] = useState<ObjectType>(originalRideData);
  const [isOpen, setIsOpen] = useState(open !== undefined ? open : false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showToast } = useToast();
  const { refreshRides } = useRides();

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
          // edit single instance of repeating ride
          axios
            .put(`/api/rides/${ride.id}/edits`, {
              deleteOnly: false,
              origDate: format_date(ride.startTime),
              ...rideData,
            })
            .then(refreshRides);
        } else {
          // edit ride or all instances of repeating ride
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
  }, [closeModal, formData, isSubmitted, ride, editSingle, refreshRides, showToast]);

  return ride ? (
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