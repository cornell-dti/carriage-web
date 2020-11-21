import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType } from '../../types/index';

const RideModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit } = useForm();

  const openModal = () => setIsOpen(true);

  const closeModal = () => setIsOpen(false);

  const onSubmit = (data: ObjectType) => {
    console.log(data);
  };

  return (
    <>
      <Button onClick={openModal}>+ Add driver</Button>
      <Modal
        title='Add a Driver'
        isOpen={isOpen}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
        </form>
      </Modal>
    </>
  );
};

export default RideModal;
