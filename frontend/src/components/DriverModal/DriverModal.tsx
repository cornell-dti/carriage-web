import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useReq } from '../../context/req';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType } from '../../types/index';
import DriverInfo from './DriverInfo';
import WorkingHours from './WorkingHours';
import Upload from './Upload';
import styles from './drivermodal.module.css';

const DriverModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { withDefaults } = useReq();
  const methods = useForm();

  const openModal = () => setIsOpen(true);

  const closeModal = () => setIsOpen(false);

  const parseAvailability = (availability: ObjectType[]) => {
    const result: ObjectType = {};
    availability.forEach(({ startTime, endTime, days }) => {
      days.forEach((day: string) => {
        result[day] = { startTime, endTime };
      });
    });
    return result;
  };

  const onSubmit = async (data: ObjectType) => {
    const { name, email, phoneNumber, carType, capacity, availability } = data;
    const vehicle = { name: carType, capacity: Number(capacity) };
    const vehicleJson = await fetch('/api/vehicles', withDefaults({
      method: 'POST',
      body: JSON.stringify(vehicle),
    }))
      .then((res) => res.json());
    const [firstName, lastName] = name.split(' ');
    const driver = {
      firstName,
      lastName,
      email,
      phoneNumber,
      availability: parseAvailability(availability),
      vehicle: vehicleJson.id,
    };
    fetch('/api/drivers', withDefaults({
      method: 'POST',
      body: JSON.stringify(driver),
    }));
    closeModal();
  };

  return (
    <>
      <Button onClick={openModal}>+ Add driver</Button>
      <Modal
        title='Add a Driver'
        isOpen={isOpen}
        onClose={closeModal}
      >
        <Upload />
        <FormProvider {...methods} >
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <DriverInfo />
            <WorkingHours />
            <Button className={styles.submit} type='submit'>Add a Driver</Button>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
};

export default DriverModal;
