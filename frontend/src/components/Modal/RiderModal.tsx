import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType } from '../../types/index';
import RiderModalInfo from './RiderModalInfo';

const RiderModal = () => {
  const [formData, setFormData] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };


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
      setIsSubmitted(false);
      console.log(formData);
    }
  }, [formData, isSubmitted]);

  return (
    <>
      <Button onClick={openModal}>+ Add ride</Button>
      <Modal
        paginate
        title={['Add a Student']}
        isOpen={isOpen}
        onClose={closeModal}
      >
        <RiderModalInfo onSubmit={saveDataThen(submitData)} />
      </Modal>
    </>
  );
};

export default RiderModal;
