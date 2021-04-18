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
import { edit } from '../../icons/other/index';

type EmployeeModalProps = {
  existingEmployee?: {
    id?: string;
    name?: string;
    netId?: string;
    email?: string;
    phone?: string;
    availability?: string[][];
    role?: string;
  }
}

const EmployeeModal = ({ existingEmployee }: EmployeeModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(
    existingEmployee?.role ? existingEmployee?.role : 'driver',
  );
  const { withDefaults } = useReq();
  const { refreshAdmins, refreshDrivers } = useEmployees();
  const methods = useForm();

  const modalTitle = existingEmployee ? 'Edit Profile' : 'Add an Employee';
  const submitButtonText = existingEmployee ? 'Save' : 'Add';

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
      const admin = {
        firstName,
        lastName,
        email,
        phoneNumber,
      };
      if (existingEmployee) {
        // Update an existing admin
        fetch(`/api/admins/${existingEmployee.id}`, withDefaults({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(admin),
        })).then(() => refreshAdmins());
      } else {
        // Create a new admin
        fetch('/api/admins', withDefaults({
          method: 'POST',
          body: JSON.stringify(admin),
        })).then(() => refreshAdmins());
      }
    } else {
      const driver = {
        firstName,
        lastName,
        email,
        phoneNumber,
        availability: parseAvailability(availability),
        admin: selectedRole === 'both',
      };
      if (existingEmployee) {
        // Update an existing driver
        fetch(`/api/drivers/${existingEmployee.id}`, withDefaults({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(driver),
        })).then(() => refreshDrivers());
      } else {
        // Create a new driver
        fetch('/api/drivers', withDefaults({
          method: 'POST',
          body: JSON.stringify(driver),
        })).then(() => refreshDrivers());
      }
    }
    closeModal();
  };

  return (
    <>
      {
        existingEmployee
          ? <img className={styles.edit} alt="edit" src={edit} onClick={openModal} />
          : <Button onClick={openModal}>+ Add an employee</Button>
      }
      <Modal
        title={modalTitle}
        isOpen={isOpen}
        onClose={closeModal}
      >
        <Upload />
        <FormProvider {...methods} >
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <EmployeeInfo
              name={existingEmployee?.name}
              netId={existingEmployee?.netId}
              email={existingEmployee?.email}
              phone={existingEmployee?.phone}
            />
            {
              selectedRole === 'admin' ? null
                : <WorkingHours
                  existingAvailability={existingEmployee?.availability}
                />
            }
            <RoleSelector
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
            />
            <Button className={styles.submit} type='submit'>
              {submitButtonText}
            </Button>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
};

export default EmployeeModal;
