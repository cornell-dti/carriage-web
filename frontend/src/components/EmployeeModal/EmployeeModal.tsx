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

  /**
   * Converts availabilities expressed as an array of {starTime, endTime, days}
   * objects into an object mapping the day to the start and end time of each
   * availability period
   *
   * @param availability the availibity array to convert
   * @returns the availibity array expressed as an object mapping the day to
   * the start and end time of each availibility period
   */
  const parseAvailability = (availability: ObjectType[]) => {
    const result: ObjectType = {};
    availability.forEach(({ startTime, endTime, days }) => {
      days.forEach((day: string) => {
        result[day] = { startTime, endTime };
      });
    });
    return result;
  };

  /**
   * The function `uploadPhotoForEmployee` uploads a photo for an employee by sending a POST request to
   * the `/api/upload` endpoint with the employee's ID, table name, and image file buffer, and then calls
   * the `refresh` function to update the data.
   * @param employeeId - unique identifier of the employee for whom the photo is being uploaded
   * @param table - represents the table where the photo will be uploaded
   * @param refresh - a function that is called after the photo is successfully uploaded.
   * It is used to refresh the data or UI after the upload is complete.
   */
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

  /**
   * The function creates a new employee by sending a POST request to an endpoint, and if an image has
   * been uploaded, it also uploads the photo for the employee.
   * @param employeeData - an object that contains the data for the new employee. It can be of type `AdminData`
   * or `DriverData`. The specific properties and structure of `employeeData` would depend on these types
   * @param endpoint - The URL where the request will be sent to create a new employee.
   * @param refresh - called after the employee has been added or updated. It is used to refresh the data
   *  or UI to reflect the changes made to the employee.
   * @param table - represents the table or collection in the database where the employee data will be stored.
   * @returns a Promise that resolves to the response object from the axios post request.
   */
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
    return res.data;
  };

  /**
   * The function `updateExistingEmployee` updates an existing employee's data, sends a PUT request to
   * the specified endpoint, refreshes the data, displays a success toast message, and uploads a photo if
   * provided.
   * @param employeeData - an object that contains the updated data for an employee. It can be of type `AdminData`
   *  or `DriverData`. The specific properties and structure of `employeeData` would depend on these types
   * @param endpoint - the URL endpoint where the API request will be sent to update the existing employee data.
   * @param refresh - a function that is called after the employee data is updated. It is used to refresh the data
   * or update the UI to reflect the changes made to the employee.
   * @param table - a string that represents the table or collection in the database where the employee data
   * is stored. It is used in the `uploadPhotoForEmployee` function to specify the table where the employee's
   * photo should be uploaded.
   * @returns the updated employee data.
   */
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
    const updatedEmployeeData = updatedEmployee.data;
    if (imageBase64 !== '') {
      uploadPhotoForEmployee(updatedEmployeeData.id, table, refresh, false);
    }
    return updatedEmployeeData;
  };

  /**
   * The function `createOrUpdateEmployee` is a TypeScript React function that creates or updates an
   * employee based on the provided data and parameters.
   * @param employee - an object that contains the data of the employee.
   * @param isNewEmployee - A boolean value indicating whether the employee is new or existing.
   * @param apiEndpoint - A string that represents the API endpoint where the employee data will be sent.
   * It should be in the format of '/api/drivers' or '/api/admins', depending on the type of employee being
   * created or updated.
   * @param refreshFunction - A function that is responsible for refreshing the data after creating or
   * updating an employee. It should be a function that returns a promise, indicating when the data has
   * been refreshed.
   * @param employeeType - the type of employee. It can be either "admin" or "driver".
   * @returns the result of either the `createNewEmployee` or `updateExistingEmployee` function,
   * depending on the value of `isNewEmployee`.
   */
  const createOrUpdateEmployee = async (
    employee: AdminData | DriverData, // Employee data
    isNewEmployee: boolean,
    apiEndpoint: string, // API endpoint as a string, e.g., '/api/drivers' or '/api/admins'
    refreshFunction: () => Promise<void>, // Function to refresh the data
    employeeType: string // Employee type as a string, e.g., 'Drivers' or 'Admins'
  ) => {
    if (isNewEmployee) {
      return await createNewEmployee(
        employee,
        apiEndpoint,
        refreshFunction,
        employeeType
      );
    } else {
      return await updateExistingEmployee(
        employee,
        apiEndpoint,
        refreshFunction,
        employeeType
      );
    }
  };

  /**
   * The function `deleteDriver` is an asynchronous function that sends a DELETE request to the
   * `/api/drivers/` endpoint using axios.
   * @param {string | undefined} id - The `id` parameter is a string that represents the unique
   * identifier of a driver.
   */
  const deleteDriver = async (id: string | undefined) => {
    await axios.delete(`/api/drivers/${id}`);
  };

  /**
   * The deleteAdmin function is used to delete an admin by making a DELETE request to the
   * /api/admins/{id} endpoint.
   * @param {string | undefined} id - The `id` parameter is a string that represents the unique
   * identifier of the admin that you want to delete.
   */
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
            await createOrUpdateEmployee(
              driver,
              false,
              '/api/drivers',
              refreshDrivers,
              'Drivers'
            );
            await createOrUpdateEmployee(
              admin,
              false,
              '/api/admins',
              refreshAdmins,
              'Admins'
            );
          } else if (existingDriver) {
            await createOrUpdateEmployee(
              driver,
              false,
              '/api/drivers',
              refreshDrivers,
              'Drivers'
            );
            const adminData = { ...admin, id: existingEmployee.id };
            await createOrUpdateEmployee(
              adminData,
              true,
              '/api/admins',
              refreshAdmins,
              'Admins'
            );
          } else if (existingAdmin) {
            const driverData = { ...driver, id: existingEmployee.id };
            await createOrUpdateEmployee(
              driverData,
              true,
              '/api/drivers',
              refreshDrivers,
              'Drivers'
            );
            await createOrUpdateEmployee(
              admin,
              false,
              '/api/admins',
              refreshAdmins,
              'Admins'
            );
          }
        } else {
          if (existingDriver && existingAdmin) {
            await createOrUpdateEmployee(
              driver,
              false,
              '/api/drivers',
              refreshDrivers,
              'Drivers'
            );
            await deleteAdmin(existingEmployee.id);
          } else if (existingDriver) {
            await createOrUpdateEmployee(
              driver,
              false,
              '/api/drivers',
              refreshDrivers,
              'Drivers'
            );
          } else if (existingAdmin) {
            const driverData = { ...driver, id: existingEmployee.id };
            await createOrUpdateEmployee(
              driverData,
              true,
              '/api/drivers',
              refreshDrivers,
              'Drivers'
            );
            await deleteAdmin(existingEmployee.id);
          }
        }
      } else {
        if (existingDriver && existingAdmin) {
          await deleteDriver(existingEmployee.id);
          await createOrUpdateEmployee(
            admin,
            false,
            '/api/admins',
            refreshAdmins,
            'Admins'
          );
        } else if (existingDriver) {
          await deleteDriver(existingEmployee.id);
          const adminData = { ...admin, id: existingEmployee.id };
          await createOrUpdateEmployee(
            adminData,
            true,
            '/api/admins',
            refreshAdmins,
            'Admins'
          );
        }
      }
    } else {
      if (selectedRole.includes('driver')) {
        if (selectedRole.some((role) => role.includes('admin'))) {
          // const id = (await createOrUpdateDriver(driver, true)).data.data.id;
          const updatedDriver = await createOrUpdateEmployee(
            driver,
            true,
            '/api/drivers',
            refreshDrivers,
            'Drivers'
          );
          const id = updatedDriver.data.id;
          await createOrUpdateEmployee(
            { ...admin, id },
            true,
            '/api/admins',
            refreshAdmins,
            'Admins'
          );
        } else {
          await createOrUpdateEmployee(
            driver,
            true,
            '/api/drivers',
            refreshDrivers,
            'Drivers'
          );
        }
      } else {
        await createOrUpdateEmployee(
          admin,
          true,
          '/api/admins',
          refreshAdmins,
          'Admins'
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
      <Modal
        title={modalTitle}
        isOpen={isOpen}
        onClose={closeModal}
        id="employee-modal"
      >
        <Upload
          imageChange={updateBase64}
          existingPhoto={existingEmployee?.photoLink}
        />
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            aria-labelledby="employee-modal"
          >
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
