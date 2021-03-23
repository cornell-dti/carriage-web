import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useReq } from '../../context/req';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType } from '../../types/index';
import DriverInfo from './DriverInfo';
import RoleSelector from './RoleSelector';
import WorkingHours from './WorkingHours';
import Upload from './Upload';
import styles from './drivermodal.module.css';
import { useDrivers } from '../../context/DriversContext';

const DriverModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { withDefaults } = useReq();
  const { refreshDrivers } = useDrivers();
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
    const { name, email, phoneNumber, availability } = data;
    const [firstName, lastName] = name.split(' ');
    const driver = {
      firstName,
      lastName,
      email,
      phoneNumber,
      availability: parseAvailability(availability),
    };
    fetch('/api/drivers', withDefaults({
      method: 'POST',
      body: JSON.stringify(driver),
    })).then(() => refreshDrivers());
    closeModal();
  };

  return (
    <>
      <Button onClick={openModal}>+ Add driver</Button>
      <Modal
        title='Add an Employee'
        isOpen={isOpen}
        onClose={closeModal}
      >
        <Upload />
        <FormProvider {...methods} >
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <DriverInfo />
            <WorkingHours />
            <RoleSelector />
            <Button className={styles.submit} type='submit'>Add a Driver</Button>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
};

export default DriverModal;
