import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useReq } from '../../context/req';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType } from '../../types/index';
import EmployeeInfo from './EmployeeInfo';
import RoleSelector from './RoleSelector';
import WorkingHours from './WorkingHours';
import Toast from '../ConfirmationToast/ConfirmationToast';
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
  const [showingToast, setToast] = useState(false);
  const [imageBase64, setImageBase64] = useState('');
  const { withDefaults } = useReq();
  const { refreshAdmins, refreshDrivers } = useEmployees();
  const methods = useForm();

  const modalTitle = existingEmployee ? 'Edit Profile' : 'Add an Employee';
  const submitButtonText = existingEmployee ? 'Save' : 'Add';

  const openModal = () => {
    setIsOpen(true);
    setToast(false);
  };

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

        // If no image has been uploaded, post admin data to the endpoint
        if (imageBase64 === '') {
          fetch('/api/admins', withDefaults({
            method: 'POST',
            body: JSON.stringify(admin),
          })).then(() => {
            refreshAdmins();
            setToast(true);
          });
        } else {
          const createdAdmin = await fetch('/api/admins', withDefaults({
            method: 'POST',
            body: JSON.stringify(admin),
          })).then((res) => res.json());

          // Upload image
          const photo = {
            id: createdAdmin.id,
            tableName: 'Admins',
            fileBuffer: imageBase64,
          };
          await fetch('/api/upload', withDefaults({
            method: 'POST',
            body: JSON.stringify(photo),
          })).then(() => {
            refreshAdmins();
            setToast(true);
          }).catch((err) => console.log(err));
        }
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

        // If no image has been uploaded, post driver data to the endpoint
        if (imageBase64 === '') {
          fetch('/api/drivers', withDefaults({
            method: 'POST',
            body: JSON.stringify(driver),
          })).then(() => {
            refreshDrivers();
            setToast(true);
          });
        } else {
          const createdDriver = await fetch('/api/drivers', withDefaults({
            method: 'POST',
            body: JSON.stringify(driver),
          })).then((res) => res.json());

          // Upload image
          const photo = {
            id: createdDriver.id,
            tableName: 'Drivers',
            fileBuffer: imageBase64,
          };
          await fetch('/api/upload', withDefaults({
            method: 'POST',
            body: JSON.stringify(photo),
          })).then(() => {
            refreshDrivers();
            setToast(true);
          }).catch((err) => console.log(err));
        }
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
      {
        existingEmployee
          ? <img className={styles.edit} alt="edit" src={edit} onClick={openModal} />
          : <Button onClick={openModal}>+ Add an employee</Button>
      }
      {showingToast ? <Toast message='The employee has been added.' /> : null}
      <Modal
        title={modalTitle}
        isOpen={isOpen}
        onClose={closeModal}
      >
        <Upload imageChange={updateBase64} />
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
