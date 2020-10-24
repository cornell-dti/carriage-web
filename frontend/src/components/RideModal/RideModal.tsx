import React, { useEffect, useState } from 'react';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { DriverPage, RiderInfoPage, RideTimesPage } from './Pages';
import { ObjectType } from '../../types/index';

const RideModal = () => {
  const [formData, setFormData] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const openModal = () => {
    setCurrentPage(0);
    setIsOpen(true);
  };

  const goNextPage = () => setCurrentPage((p) => p + 1);

  const closeModal = () => setIsOpen(false);

  const saveDataThen = (next: () => void) => (data: ObjectType) => {
    setFormData((prev) => ({ ...prev, ...data }));
    next();
  };

  const submitData = () => {
    setIsSubmitted(true);
    closeModal();
  };

  useEffect(() => {
    if (isSubmitted) {
      fetch('/rides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      setIsSubmitted(false);
    }
  }, [formData, isSubmitted]);

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
        <RideTimesPage onSubmit={saveDataThen(goNextPage)} />
        <DriverPage onSubmit={saveDataThen(goNextPage)} />
        <RiderInfoPage onSubmit={saveDataThen(submitData)} />
      </Modal>
    </>
  );
};

export default RideModal;
