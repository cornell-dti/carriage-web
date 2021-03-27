import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useReq } from '../../context/req';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType } from '../../types/index';
import EmployeeInfo from './EmployeeInfo';
import RoleSelector from './RoleSelector';
import WorkingHours from './WorkingHours';
import Upload from './Upload';
import styles from './employeemodal.module.css';
import { useEmployees } from '../../context/EmployeesContext';

const EmployeeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('driver');
  const { withDefaults } = useReq();
  const { refreshAdmins, refreshDrivers } = useEmployees();
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

    if (selectedRole === 'admin') {
      console.log('admin selected!')
      const admin = {
        firstName,
        lastName,
        email,
        phoneNumber,
      };
      fetch('/api/admins', withDefaults({
        method: 'POST',
        body: JSON.stringify(admin),
      })).then(() => refreshAdmins());
    } else {
      console.log('driver selected!');
      console.log('both?: ' + (selectedRole === 'both'));
      const driver = {
        firstName,
        lastName,
        email,
        phoneNumber,
        availability: parseAvailability(availability),
        admin: selectedRole === 'both'
      };
      fetch('/api/drivers', withDefaults({
        method: 'POST',
        body: JSON.stringify(driver),
      })).then(() => refreshDrivers());
    }
    closeModal();
  };

  return (
    <>
      <Button onClick={openModal}>+ Add an employee</Button>
      <Modal
        title='Add an Employee'
        isOpen={isOpen}
        onClose={closeModal}
      >
        <Upload />
        <FormProvider {...methods} >
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <EmployeeInfo />
            {selectedRole === 'admin' ? null : <WorkingHours />}
            <RoleSelector 
              selectedRole={selectedRole} 
              setSelectedRole={setSelectedRole}
            />
            <Button className={styles.submit} type='submit'>Add</Button>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
};

export default EmployeeModal;
