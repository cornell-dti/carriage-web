import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { DriverPage, RiderInfoPage, RideTimesPage } from './Pages';
import { ObjectType } from '../../types/index';
import { useReq } from '../../context/req';
import { useDate } from '../../context/date';


const RideModal = () => {
  const [formData, setFormData] = useState<ObjectType>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const { withDefaults } = useReq();
  const { curDate } = useDate();

  const openModal = () => {
    setCurrentPage(0);
    setIsOpen(true);
  };

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

  const submitData = () => setIsSubmitted(true);

  useEffect(() => {
    const isFormComplete = Object.keys(formData).length === 6;
    if (isSubmitted && isFormComplete) {
      const {
        pickupTime, dropoffTime, driver, rider, startLocation, endLocation,
      } = formData;
      const date = curDate.toLocaleDateString();
      const startTime = moment(`${date} ${pickupTime}`).toISOString();
      const endTime = moment(`${date} ${dropoffTime}`).toISOString();
      const isUnscheduled = driver === 'None';
      const ride = {
        type: isUnscheduled ? 'unscheduled' : 'active',
        startLocation,
        endLocation,
        driver: isUnscheduled ? undefined : driver,
        rider,
        startTime,
        requestedEndTime: endTime,
      };
      fetch('/api/rides', withDefaults({
        method: 'POST',
        body: JSON.stringify(ride),
      }));
      setIsSubmitted(false);
      closeModal();
    }
  }, [curDate, formData, isSubmitted, withDefaults]);

  return (
    <>
      <Button onClick={openModal}>+ Add ride</Button>
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
          onSubmit={saveDataThen(goNextPage)} />
        <RiderInfoPage
          onBack={goPrevPage}
          onSubmit={saveDataThen(submitData)}
        />
      </Modal>
    </>
  );
};

export default RideModal;
