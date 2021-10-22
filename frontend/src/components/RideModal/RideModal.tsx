import React, { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import Toast from '../ConfirmationToast/ConfirmationToast';
import { DriverPage, RiderInfoPage, RideTimesPage } from './Pages';
import { ObjectType, Ride } from '../../types/index';
import { useReq } from '../../context/req';
import { format_date } from '../../util/index';

type RideModalProps = {
  open?: boolean;
  close?: () => void;
  ride?: Ride;
};

const RideModal = ({ open, close, ride }: RideModalProps) => {
  const originalRideData = ride
    ? {
        date: format_date(ride.startTime),
        pickupTime: moment(ride.startTime).format('kk:mm'),
        dropoffTime: moment(ride.endTime).format('kk:mm'),
        rider: `${ride.rider.firstName} ${ride.rider.lastName}`,
        pickupLoc: ride.startLocation.id
          ? ride.startLocation.name
          : ride.startLocation.address,
        dropoffLoc: ride.endLocation.id
          ? ride.endLocation.name
          : ride.endLocation.address
      }
    : {};
  const [formData, setFormData] = useState<ObjectType>(originalRideData);
  const [isOpen, setIsOpen] = useState(open !== undefined ? open : false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showingToast, setToast] = useState(false);
  const { withDefaults } = useReq();

  const goNextPage = () => setCurrentPage((p) => p + 1);

  const goPrevPage = () => setCurrentPage((p) => p - 1);

  const openModal = () => {
    setCurrentPage(0);
    setIsOpen(true);
    setToast(false);
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

  useEffect(() => {
    if (isSubmitted) {
      const {
        date,
        pickupTime,
        dropoffTime,
        driver,
        rider,
        startLocation,
        endLocation
      } = formData;
      const startTime = moment(`${date} ${pickupTime}`).toISOString();
      const endTime = moment(`${date} ${dropoffTime}`).toISOString();
      const hasDriver = Boolean(driver) && driver !== 'None';
      const rideData: ObjectType = {
        type: hasDriver ? 'active' : 'unscheduled',
        startTime,
        endTime,
        driver: hasDriver ? driver : undefined,
        rider,
        startLocation,
        endLocation
      };
      if (ride) {
        if (ride.type === 'active') {
          rideData.type = 'unscheduled';
        }
        fetch(
          `/api/rides/${ride.id}`,
          withDefaults({
            method: 'PUT',
            body: JSON.stringify(rideData)
          })
        );
      } else {
        fetch(
          '/api/rides',
          withDefaults({
            method: 'POST',
            body: JSON.stringify(rideData)
          })
        );
      }
      setIsSubmitted(false);
      closeModal();
      setToast(true);
    }
  }, [closeModal, formData, isSubmitted, ride, withDefaults]);

  // have to do a ternary operator on the entire modal
  // because otherwise the pages would show up wrongly
  return ride ? (
    <>
      {showingToast ? <Toast message="Ride edited." /> : null}
      <Modal
        paginate
        title={['Edit Ride', 'Edit Ride']}
        isOpen={open || isOpen}
        currentPage={currentPage}
        onClose={closeModal}
      >
        <RideTimesPage
          isEditing
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
      {showingToast ? <Toast message="Ride added." /> : null}
      {/* only have a button if this modal is not controlled by a table */}
      {!open && <Button onClick={openModal}>+ Add ride</Button>}
      <Modal
        paginate
        title={['Add a Ride', 'Available Drivers', 'Add a Ride']}
        isOpen={isOpen}
        currentPage={currentPage}
        onClose={closeModal}
      >
        <RideTimesPage
          formData={formData}
          onSubmit={saveDataThen(goNextPage)}
        />
        <DriverPage
          formData={formData}
          onBack={goPrevPage}
          onSubmit={saveDataThen(goNextPage)}
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
