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
  const [imageBase64, setImageBase64] = useState('');

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
      const admin = {
        firstName,
        lastName,
        email,
        phoneNumber,
      };
      if (imageBase64 === '') {
        fetch('/api/admins', withDefaults({
          method: 'POST',
          body: JSON.stringify(admin),
        })).then(() => refreshAdmins());
      } else {
        const createdAdmin = await fetch('/api/admins', withDefaults({
          method: 'POST',
          body: JSON.stringify(admin),
        })).then((res) => res.json());

        // upload image
        const photo = {
          id: createdAdmin.id,
          tableName: 'Admins',
          fileBuffer: imageBase64,
        };
        await fetch('/api/upload', withDefaults({
          method: 'POST',
          body: JSON.stringify(photo),
        })).then(() => refreshAdmins()).catch((err) => console.log(err));
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
      if (imageBase64 === '') {
      fetch('/api/drivers', withDefaults({
        method: 'POST',
        body: JSON.stringify(driver),
      })).then(() => refreshDrivers());
      } else {
        const createdDriver = await fetch('/api/drivers', withDefaults({
          method: 'POST',
          body: JSON.stringify(driver),
        })).then((res) => res.json());

        // upload image
        const photo = {
          id: createdDriver.id,
          tableName: 'Drivers',
          fileBuffer: imageBase64,
        };
        await fetch('/api/upload', withDefaults({
          method: 'POST',
          body: JSON.stringify(photo),
        })).then(() => refreshDrivers()).catch((err) => console.log(err));
      }
    }
    closeModal();
  };

  function updateBase64(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();

    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      const file = e.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = function () {
        let res = reader.result;
        if (res) {
          res = res.toString();
          // remove "data:image/png;base64," and "data:image/jpeg;base64,"
          const strBase64 = res.toString().substring(res.indexOf(',') + 1);
          setImageBase64(strBase64);
        }
      };
      reader.onerror = function (error) {
        console.log('Error reading file: ', error);
      };
    } else {
      console.log('Undefined file upload');
    }
  }

  return (
    <>
      <Button onClick={openModal}>+ Add an employee</Button>
      <Modal
        title='Add an Employee'
        isOpen={isOpen}
        onClose={closeModal}
      >
        <Upload imageChange={updateBase64} />
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
