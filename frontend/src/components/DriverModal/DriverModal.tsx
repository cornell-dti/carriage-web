import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType } from '../../types/index';
import DriverInfo from './DriverInfo';
import WorkingHours from './WorkingHours';
import { WorkingHoursProvider } from './WorkingHoursContext';

const DriverModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [availability, setAvailability] = useState<ObjectType>({});
  const { register, handleSubmit } = useForm();

  const openModal = () => setIsOpen(true);

  const closeModal = () => setIsOpen(false);

  const handleWorkingHoursChange = (data: ObjectType) => {
    setAvailability(data);
  };

  const onSubmit = (data: ObjectType) => {
    console.log(data, availability);
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
          <DriverInfo register={register} />
          <WorkingHoursProvider>
            <WorkingHours onChange={handleWorkingHoursChange} />
          </WorkingHoursProvider>
        </form>
      </Modal>
    </>
  );
};

export default DriverModal;
