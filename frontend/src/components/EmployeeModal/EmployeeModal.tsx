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
    type?: string[];
    isDriver?: boolean;
    netId?: string;
    email?: string;
    phone?: string;
    availability?: string[][];
    startDate?: string;
    photoLink?: string;
  };
  isOpen: boolean;
  setIsOpen: any;
};

type AdminData = {
  id?: string;
  firstName: any;
  lastName: any;
  type: string[];
  isDriver: boolean;
  email: any;
  phoneNumber: any;
};

type DriverData = {
  id?: string;
  firstName: any;
  lastName: any;
  email: any;
  phoneNumber: any;
  availability: ObjectType;
};

const EmployeeModal = ({
  existingEmployee,
  isOpen,
  setIsOpen,
}: EmployeeModalProps) => {
  const { showToast } = useToast();

  if (existingEmployee?.isDriver !== undefined) {
    if (existingEmployee.isDriver) {
      existingEmployee?.type?.push('driver');
    }
  } else if (existingEmployee) {
    existingEmployee.type = existingEmployee?.type || ['driver'];
  }

  const [selectedRole, setSelectedRole] = useState<string[]>(
    existingEmployee?.type || []
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
    return res;
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
    return updatedEmployee;
  };

  const createOrUpdateDriver = async (
    driver: AdminData | DriverData,
    isNewDriver = false
  ) => {
    if (isNewDriver) {
      return await createNewEmployee(
        driver,
        '/api/drivers',
        () => refreshDrivers(),
        'Drivers'
      );
    } else {
      return await updateExistingEmployee(
        driver,
        '/api/drivers',
        () => refreshDrivers(),
        'Drivers'
      );
    }
  };

  const createOrUpdateAdmin = async (admin: AdminData, isNewAdmin = false) => {
    if (isNewAdmin) {
      await createNewEmployee(
        admin,
        '/api/admins',
        () => refreshAdmins(),
        'Admins'
      );
    } else {
      await updateExistingEmployee(
        admin,
        '/api/admins',
        () => refreshAdmins(),
        'Admins'
      );
    }
  };

  const deleteDriver = async (id: string | undefined) => {
    await axios.delete(`/api/drivers/${id}`);
  };

  const deleteAdmin = async (id: string | undefined) => {
    await axios.delete(`/api/admins/${id}`);
  };

  const onSubmit = async (data: ObjectType) => {
    const { firstName, lastName, netid, phoneNumber, startDate, availability } =
      data;

    const driver = {
      firstName,
      lastName,
      email: netid + '@cornell.edu',
      phoneNumber,
      startDate,
      availability: parseAvailability(availability),
    };

    const admin = {
      firstName,
      lastName,
      email: netid + '@cornell.edu',
      type: selectedRole.filter((role) => !(role === 'driver')),
      phoneNumber,
      availability: parseAvailability(availability),
      isDriver: selectedRole.includes('driver'),
    };

    const existingDriver = existingEmployee?.isDriver === undefined;
    const existingAdmin = existingEmployee?.isDriver !== undefined;

    if (existingEmployee) {
      if (selectedRole.includes('driver')) {
        if (selectedRole.some((role) => role.includes('admin'))) {
          if (existingDriver && existingAdmin) {
            await createOrUpdateDriver(driver, false);
            await createOrUpdateAdmin(admin, false);
          } else if (existingDriver) {
            await createOrUpdateDriver(driver, false);
            await createOrUpdateAdmin(
              { ...admin, id: existingEmployee.id },
              true
            );
          } else if (existingAdmin) {
            await createOrUpdateDriver(
              { ...driver, id: existingEmployee.id },
              true
            );
            await createOrUpdateAdmin(admin, false);
          }
        } else {
          if (existingDriver && existingAdmin) {
            await createOrUpdateDriver(driver, false);
            await deleteAdmin(existingEmployee.id);
          } else if (existingDriver) {
            await createOrUpdateDriver(driver, false);
          } else if (existingAdmin) {
            await createOrUpdateDriver(
              { ...driver, id: existingEmployee.id },
              true
            );
            await deleteAdmin(existingEmployee.id);
          }
        }
      } else {
        if (existingDriver && existingAdmin) {
          await deleteDriver(existingEmployee.id);
          await createOrUpdateAdmin(admin, false);
        } else if (existingDriver) {
          await deleteDriver(existingEmployee.id);
          await createOrUpdateAdmin(
            { ...admin, id: existingEmployee.id },
            true
          );
        }
      }
    } else {
      if (selectedRole.includes('driver')) {
        if (selectedRole.some((role) => role.includes('admin'))) {
          const id = (await createOrUpdateDriver(driver, true)).data.data.id;
          await createOrUpdateAdmin({ ...admin, id: id }, true);
        } else {
          await createOrUpdateDriver(driver, true);
        }
      } else {
        await createOrUpdateAdmin(admin, true);
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
              selectedRoles={selectedRole}
              setSelectedRoles={setSelectedRole}
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
