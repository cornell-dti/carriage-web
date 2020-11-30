import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType } from '../../types/index';
import DriverInfo from './DriverInfo';
import WorkingHours from './WorkingHours';
import Upload from './Upload';
import styles from './drivermodal.module.css';

const DriverModal = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  const onSubmit = (data: ObjectType) => {
    const { availability, capacity, carType, email, name, netid, phone } = data;
    const parsedAvail = parseAvailability(availability);
    const vehicle = { name: carType, capacity: Number(capacity) };
    console.log({ email, name, netid, phone, availability: parsedAvail, vehicle });
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
