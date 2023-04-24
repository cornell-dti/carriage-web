import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType } from '../../types/index';
import EmployeeInfo from './EmployeeInfo';
import RoleSelector from './RoleSelector';
import StartDate from './StartDate';
import WorkingHours from './WorkingHours';
import Upload from './Upload';
import styles from './employeemodal.module.css';
import { useEmployees } from '../../context/EmployeesContext';
import { edit } from '../../icons/other/index';
import { useToast, ToastStatus } from '../../context/toastContext';
import axios from '../../util/axios';

type EmployeeModalProps = {
  existingEmployee?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    netId?: string;
    email?: string;
    phone?: string;
    availability?: string[][];
    role?: string;
    startDate?: string;
    photoLink?: string;
  };
  isOpen: boolean;
  setIsOpen: any;
};

type AdminData = {
  firstName: any;
  lastName: any;
  email: any;
  phoneNumber: any;
};

type DriverData = {
  firstName: any;
  lastName: any;
  email: any;
  phoneNumber: any;
  availability: ObjectType;
  admin: boolean;
};

const EmployeeModal = ({
  existingEmployee,
  isOpen,
  setIsOpen,
}: EmployeeModalProps) => {
  const { showToast } = useToast();
  const [selectedRole, setSelectedRole] = useState(
    existingEmployee?.role ? existingEmployee?.role : 'driver'
  );
  const [imageBase64, setImageBase64] = useState('');
  const { refreshAdmins, refreshDrivers } = useEmployees();
  const methods = useForm();

  const modalTitle = existingEmployee ? 'Edit Profile' : 'Add an Employee';
  const submitButtonText = existingEmployee ? 'Save' : 'Add';

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
    isCreate: boolean // show toast if new employee is created
  ) => {
    const photo = {
      id: employeeId,
      tableName: table,
      fileBuffer: imageBase64,
    };
    // Upload image
    await axios
      .post('/api/upload', photo)
      .then(() => {
        refresh();
      })
      .catch((err) => console.log(err));
  };

  const createNewEmployee = async (
    employeeData: AdminData | DriverData,
    endpoint: string,
    refresh: () => Promise<void>,
    table: string
  ) => {
    const res = await axios.post(endpoint, employeeData);
    if (imageBase64 === '') {
      // If no image has been uploaded, create new employee
      refresh();
      showToast('The employee has been added.', ToastStatus.SUCCESS);
    } else {
      const { data: createdEmployee } = await res.data;

      uploadPhotoForEmployee(createdEmployee.id, table, refresh, true);
    }
  };

  const updateExistingEmployee = async (
    employeeData: AdminData | DriverData,
    endpoint: string,
    refresh: () => Promise<void>,
    table: string
  ) => {
    const updatedEmployee = await axios
      .put(`${endpoint}/${existingEmployee!.id}`, employeeData)
      .then((res) => {
        refresh();
        showToast('The employee has been edited.', ToastStatus.SUCCESS);
        return res.data;
      });
    if (imageBase64 !== '') {
      uploadPhotoForEmployee(updatedEmployee.id, table, refresh, false);
    }
  };

  const onSubmit = async (data: ObjectType) => {
    const { firstName, lastName, netid, phoneNumber, startDate, availability } =
      data;
    if (selectedRole === 'admin') {
      const admin = {
        firstName,
        lastName,
        email: netid + '@cornell.edu',
        phoneNumber,
      };
      if (existingEmployee) {
        updateExistingEmployee(
          admin,
          '/api/admins',
          () => refreshAdmins(),
          'Admins'
        );
      } else {
        createNewEmployee(
          admin,
          '/api/admins',
          () => refreshAdmins(),
          'Admins'
        );
      }
    } else {
      const driver = {
        firstName,
        lastName,
        email: netid + '@cornell.edu',
        phoneNumber,
        startDate,
        availability: parseAvailability(availability),
        admin: selectedRole === 'both',
      };
      if (existingEmployee) {
        updateExistingEmployee(
          driver,
          '/api/drivers',
          () => refreshDrivers(),
          'Drivers'
        );
      } else {
        createNewEmployee(
          driver,
          '/api/drivers',
          () => refreshDrivers(),
          'Drivers'
        );
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
      <Modal title={modalTitle} isOpen={isOpen} onClose={closeModal}>
        <Upload
          imageChange={updateBase64}
          existingPhoto={existingEmployee?.photoLink}
        />
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <EmployeeInfo
              firstName={existingEmployee?.firstName}
              lastName={existingEmployee?.lastName}
              netId={existingEmployee?.netId}
              phone={existingEmployee?.phone}
            />

            <StartDate existingDate={existingEmployee?.startDate} />

            <WorkingHours
              existingAvailability={existingEmployee?.availability}
              hide={false}
            />
            <RoleSelector
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
            />
            <Button className={styles.submit} type="submit">
              {submitButtonText}
            </Button>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
};

export default EmployeeModal;
