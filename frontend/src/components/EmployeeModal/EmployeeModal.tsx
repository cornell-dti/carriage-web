import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useReq } from '../../context/req';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType } from '../../types/index';
import EmployeeInfo from './EmployeeInfo';
import RoleSelector from './RoleSelector';
import StartDate from './StartDate';
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
    startDate?: string;
    photoLink?: string;
  }
}

type AdminData = {
  firstName: any;
  lastName: any;
  email: any;
  phoneNumber: any;
}

type DriverData = {
  firstName: any;
  lastName: any;
  email: any;
  phoneNumber: any;
  availability: ObjectType;
  admin: boolean;
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

  const closeModal = () => {
    methods.clearErrors();
    setIsOpen(false);
  };

  const parseAvailability = (availability: ObjectType[]) => {
    const result: ObjectType = {};
    availability.forEach(({ startTime, endTime, days }) => {
      days.forEach((day: string) => {
        result[day] = { startTime, endTime };
      });
    });
    return result;
  };

  const uploadPhotoForEmployee = async (
    employeeId: string,
    table: string,
    refresh: () => Promise<void>,
    isCreate: boolean, // show toast if new employee is created
  ) => {
    const photo = {
      id: employeeId,
      tableName: table,
      fileBuffer: imageBase64,
    };
    // Upload image
    await fetch('/api/upload', withDefaults({
      method: 'POST',
      body: JSON.stringify(photo),
    })).then(() => {
      refresh();
      setToast(isCreate);
    }).catch((err) => console.log(err));
  };

  const createNewEmployee = async (
    employeeData: AdminData | DriverData,
    endpoint: string,
    refresh: () => Promise<void>,
    table: string,
  ) => {
    if (imageBase64 === '') {
      // If no image has been uploaded, create new employee
      fetch(endpoint, withDefaults({
        method: 'POST',
        body: JSON.stringify(employeeData),
      })).then(() => {
        refresh();
        setToast(true);
      });
    } else {
      const createdEmployee = await fetch(endpoint, withDefaults({
        method: 'POST',
        body: JSON.stringify(employeeData),
      })).then((res) => res.json());

      uploadPhotoForEmployee(createdEmployee.id, table, refresh, true);
    }
  };

  const updateExistingEmployee = async (
    employeeData: AdminData | DriverData,
    endpoint: string,
    refresh: () => Promise<void>,
    table: string,
  ) => {
    const updatedEmployee = await fetch(`${endpoint}/${existingEmployee!.id}`, withDefaults({
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData),
    })).then((res) => res.json());

    uploadPhotoForEmployee(updatedEmployee.id, table, refresh, false);
  };

  const onSubmit = async (data: ObjectType) => {
    const { name, email, phoneNumber, startDate, availability } = data;
    const [firstName, lastName] = name.split(' ');

    if (selectedRole === 'admin') {
      const admin = {
        firstName,
        lastName,
        email,
        phoneNumber,
      };
      if (existingEmployee) {
        updateExistingEmployee(admin, '/api/admins', () => refreshAdmins(), 'Admins');
      } else {
        createNewEmployee(admin, '/api/admins', () => refreshAdmins(), 'Admins');
      }
    } else {
      const driver = {
        firstName,
        lastName,
        email,
        phoneNumber,
        startDate,
        availability: parseAvailability(availability),
        admin: selectedRole === 'both',
      };
      if (existingEmployee) {
        updateExistingEmployee(driver, '/api/drivers', () => refreshDrivers(), 'Drivers');
      } else {
        createNewEmployee(driver, '/api/drivers', () => refreshDrivers(), 'Drivers');
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
        <Upload
          imageChange={updateBase64}
          existingPhoto={existingEmployee?.photoLink}
        />
        <FormProvider {...methods} >
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <EmployeeInfo
              name={existingEmployee?.name}
              netId={existingEmployee?.netId}
              email={existingEmployee?.email}
              phone={existingEmployee?.phone}
            />
            {
              selectedRole === 'admin'
                ? null
                : <StartDate existingDate={existingEmployee?.startDate} />
            }
            <WorkingHours existingAvailability={existingEmployee?.availability} hide={selectedRole === 'admin'} />
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
