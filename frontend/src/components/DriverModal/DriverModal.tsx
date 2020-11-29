import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType } from '../../types/index';
import DriverInfo from './DriverInfo';
import WorkingHours from './WorkingHours';
import { WorkingHoursProvider } from './WorkingHoursContext';
import styles from './drivermodal.module.css';

const DriverModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { register, setValue, handleSubmit } = useForm();

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
          <DriverInfo register={register} />
          <WorkingHoursProvider>
            <WorkingHours register={register} setValue={setValue} />
          </WorkingHoursProvider>
          <Button className={styles.submit} type='submit'>Add a Driver</Button>
        </form>
      </Modal>
    </>
  );
};

export default DriverModal;
