import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Modal from '../Modal/Modal';
import { DriverPage, RiderInfoPage, RideTimesPage } from './Pages';
import { ObjectType, Ride } from '../../types/index';
import { useReq } from '../../context/req';

type RideModalProps = {
  currentPage: number,
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
  isOpen: boolean,
  setIsOpen:  React.Dispatch<React.SetStateAction<boolean>>,
  ride?: Ride
}

const RideModal = ({currentPage, setCurrentPage, isOpen, setIsOpen, ride}: RideModalProps) => {
  const [formData, setFormData] = useState<ObjectType>(
    ride ? 
    {
      date: moment(ride.startTime).format('YYYY-MM-DD'),
      pickupTime: moment(ride.startTime).format('kk:mm'),
      dropoffTime: moment(ride.endTime).format('kk:mm'),
      driver: ride.driver?.id,
      rider: ride.rider,
      startLocation: ride.startLocation,
      endLocation: ride.endLocation,
    }
    :
    {}
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { withDefaults } = useReq();

  const goNextPage = () => setCurrentPage((p) => p + 1);

  const goPrevPage = () => setCurrentPage((p) => p - 1);

  const closeModal = () => {
    setFormData({});
    setIsOpen(false);
  };

  const saveDataThen = (next: () => void) => (data: ObjectType) => {
    setFormData((prev) => ({ ...prev, ...data }));
    next();
  };

  const submitData = () => {
    const {
      date, pickupTime, dropoffTime, driver, rider, startLocation, endLocation,
    } = formData;
    const startTime = new Date(`${date} ${pickupTime} EST`).toISOString();
    const endTime = new Date(`${date} ${dropoffTime} EST`).toISOString();
    setFormData({ startTime, endTime, driver, rider, startLocation, endLocation });
    setIsSubmitted(true);
  };

  useEffect(() => {
    if (isSubmitted) {
      if (ride) {
        fetch(`/api/rides/${ride.id}`, withDefaults({
          method: 'PUT',
          body: JSON.stringify(formData),
        }))
      } else {
        fetch('/api/rides', withDefaults({
          method: 'POST',
          body: JSON.stringify(formData),
        }));
      }
      setIsSubmitted(false);
      closeModal();
    }
  }, [formData, isSubmitted, withDefaults]);

  return (
      <Modal
        paginate
        title={ride ? 
          ['Edit a Ride', 'Available Drivers', 'Edit a Ride']
          :
          ['Add a Ride', 'Available Drivers', 'Add a Ride']
        }
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
          onSubmit={saveDataThen(goNextPage)} />
        <RiderInfoPage
          onBack={goPrevPage}
          onSubmit={saveDataThen(submitData)}
        />
      </Modal>
  );
};

export default RideModal;
