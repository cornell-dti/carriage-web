import React, { useEffect, useState } from 'react';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { DriverPage, RiderInfoPage, RideTimesPage } from './Pages';
import { ObjectType } from '../../types/index';
import { useReq } from '../../context/req';

const RideModal = () => {
  const [formData, setFormData] = useState<ObjectType>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const { withDefaults } = useReq();

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
    // all fields are required so just checking length should be suitable
    const isFormComplete = Object.keys(formData).length === 7;
    if (isSubmitted && isFormComplete) {
      const {
        date, pickupTime, dropoffTime, driver, rider, startLocation, endLocation,
      } = formData;
      const ride = {
        type: 'active',
        startLocation,
        endLocation,
        driver,
        rider,
        startTime: new Date(`${date} ${pickupTime} EST`).toISOString(),
        endTime: new Date(`${date} ${dropoffTime} EST`).toISOString(),
      };
      fetch('/api/rides', withDefaults({
        method: 'POST',
        body: JSON.stringify(ride),
      }));
      setIsSubmitted(false);
      closeModal();
    }
  }, [formData, isSubmitted, withDefaults]);

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
