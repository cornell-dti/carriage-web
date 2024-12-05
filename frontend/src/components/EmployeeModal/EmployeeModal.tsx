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
    if (availability === null || availability === undefined) {
      console.error('Null ptr: Availablity');
      return []; // placeholder
    } else {
      const result: ObjectType = {};
      availability.forEach(({ startTime, endTime, days }) => {
        days.forEach((day: string) => {
          result[day] = { startTime, endTime };
        });
      });
      return result;
    }
  };

  async function uploadEmployeePhoto(
    employeeId: string,
    table: string,
    refresh: () => Promise<void>,
    imageBase64: string
  ): Promise<void> {
    const photoData = {
      id: employeeId,
      tableName: table,
      fileBuffer: imageBase64,
    };
    try {
      await axios.post('/api/upload/', photoData);
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
    refresh();
  }

  /**
   * [createEmployee id employeeData endpoint refresh table iteration] creates a new employee
   * using the provided data and endpoint. Optionally uploads a photo if [iteration] is 0 and
   * [imageBase64] is non-empty.
   * Requires: [id] to be a valid string or empty, [employeeData] to be a valid object,
   * [endpoint] to be a valid API endpoint string, [refresh] to be a function, and [iteration]
   * to be a non-negative integer.
   * Returns: the created employee data.
   */
  async function createEmployee(
    id: string,
    employeeData: AdminData | DriverData,
    endpoint: string,
    refresh: () => Promise<void>,
    table: string,
    iteration: number
  ): Promise<any> {
    if (Boolean(id) && id !== '') {
      (employeeData as any).id = id;
    }
    const {
      data: { data: createdEmployee },
    } = await axios.post(endpoint, employeeData);
    if (iteration === 0 && imageBase64 !== '') {
      await uploadEmployeePhoto(
        createdEmployee.id,
        table,
        refresh,
        imageBase64
      );
    }
    await refresh();
    return createdEmployee;
  }

  /**
   * [updateEmployee id employeeData endpoint refresh table iteration] updates an existing
   * employee's data using the specified endpoint. Optionally uploads a photo if [iteration]
   * is 0 and [imageBase64] is non-empty.
   * Requires: [id] to be a valid string, [employeeData] to be a valid object, [endpoint] to
   * be a valid API endpoint string, [refresh] to be a function, and [iteration] to be a
   * non-negative integer.
   * Returns: a promise that resolves after successfully updating the employee and refreshing
   * the data.
   */

  async function updateEmployee(
    id: string,
    employeeData: AdminData | DriverData,
    endpoint: string,
    refresh: () => Promise<void>,
    table: string,
    iteration: number
  ): Promise<any> {
    await axios.put(`${endpoint}/${id}`, employeeData);
    // iteration count prevents a second write to S3
    if (iteration === 0 && imageBase64 !== '') {
      uploadEmployeePhoto(id, table, refresh, imageBase64);
    }
    refresh();
  }

  /**
   * [deleteEmployee id emptype] removes an employee with the specified [id] from the backend,
   * using the employee type [emptype] ('drivers' or 'admins') to determine the endpoint.
   * Requires: [id] to be a valid string, [emptype] to be either 'drivers' or 'admins'.
   * Returns: a promise that resolves after successfully deleting the employee.
   */

  async function deleteEmployee(id: string, emptype: 'drivers' | 'admins') {
    await axios.delete(`/api/${emptype}/${id}`);
  }

  /**
   * [processRoles selectedRole existingEmployee admin driver] processes and assigns roles
   * ('driver', 'admin') for the given employee, creating, updating, or deleting their
   * information as necessary.
   * Requires: [selectedRole] to be a valid array of roles, [existingEmployee] to be an object
   * or null, and [admin] and [driver] to be valid employee data objects.
   * Returns: a promise that resolves after processing all roles.
   */

  async function processRoles(
    selectedRole: any,
    existingEmployee: any,
    admin: any,
    driver: any
  ) {
    const containsDriver = selectedRole.includes('driver');
    const containsAdmin =
      selectedRole.includes('sds-admin') ||
      selectedRole.includes('redrunner-admin');

    const rolesToProcess = [];
    if (containsAdmin) rolesToProcess.push('admins');
    if (containsDriver) rolesToProcess.push('drivers');

    let newEmployee = null; // To track new employee creation
    let iteration = 0;

    for (const role of rolesToProcess) {
      const apiEndpoint = role === 'admins' ? '/api/admins' : '/api/drivers';
      const refreshFunction =
        role === 'admins' ? refreshAdmins : refreshDrivers;
      const entityType = role === 'admins' ? 'Admins' : 'Drivers';

      if (Boolean(existingEmployee)) {
        switch (role) {
          case 'admins':
            if (existingEmployee.isDriver && !containsDriver) {
              // Transition from driver to admin
              await deleteEmployee(
                newEmployee?.id || existingEmployee.id,
                'drivers'
              );
            }

            if (!existingEmployee.isAdmin) {
              // Create admin
              await createEmployee(
                newEmployee?.id || existingEmployee.id,
                admin,
                apiEndpoint,
                refreshFunction,
                entityType,
                iteration
              );
            } else {
              // Update admin
              await updateEmployee(
                newEmployee?.id || existingEmployee.id,
                admin,
                apiEndpoint,
                refreshFunction,
                entityType,
                iteration
              );
            }
            break;

          case 'drivers':
            if (existingEmployee.isAdmin && !containsAdmin) {
              // Transition from admin to driver
              await deleteEmployee(
                newEmployee?.id || existingEmployee.id,
                'admins'
              );
            }

            if (!existingEmployee.isDriver) {
              // Create driver
              await createEmployee(
                newEmployee?.id || existingEmployee.id,
                driver,
                apiEndpoint,
                refreshFunction,
                entityType,
                iteration
              );
            } else {
              // Update driver
              await updateEmployee(
                newEmployee?.id || existingEmployee.id,
                driver,
                apiEndpoint,
                refreshFunction,
                entityType,
                iteration
              );
            }
            break;
        }
      } else if (!newEmployee) {
        // Create a new employee if no existing employee is present
        newEmployee = await createEmployee(
          '',
          role === 'admins' ? admin : driver,
          apiEndpoint,
          refreshFunction,
          entityType,
          iteration
        );
        existingEmployee = newEmployee;
        showToast(
          `Created a new employee with the role of ${role} based on your provided data`,
          ToastStatus.SUCCESS
        );
      }
      iteration += 1;
    }
  }

  /**
   * [onSubmit data] handles form submission, processes employee data, and invokes role
   * processing.
   * Requires: [data] to be an object containing valid employee form fields, including
   * [firstName], [lastName], [netid], [phoneNumber], [startDate], and [availability].
   * Returns: a promise that resolves after successfully processing the form data.
   */

  async function onSubmit(data: ObjectType) {
    const { firstName, lastName, netid, phoneNumber, startDate, availability } =
      data;

    const driver = {
      firstName,
      lastName,
      email: `${netid}@cornell.edu`,
      phoneNumber,
      startDate,
      availability: parseAvailability(availability),
    };

    const admin = {
      firstName,
      lastName,
      email: `${netid}@cornell.edu`,
      type: selectedRole.filter((role) => role !== 'driver'),
      phoneNumber,
      availability: parseAvailability(availability),
      isDriver: selectedRole.includes('driver'),
    };

    try {
      await processRoles(selectedRole, existingEmployee, admin, driver);
      showToast(`Employee information proccessed`, ToastStatus.SUCCESS);
    } catch (error) {
      showToast('An error occured: ', ToastStatus.ERROR);
    } finally {
      closeModal();
    }
  }

  /**
   * [updateBase64 e] updates the [imageBase64] state by converting the selected file from the
   * input event [e] into a base64-encoded string.
   * Requires: [e] to be a valid React change event containing file input data.
   * Returns: a promise that resolves after successfully updating the [imageBase64] state.
   */
  async function updateBase64(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();

    const { files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(',')[1]; // Extract base64
        if (base64) {
          setImageBase64(base64); // Save the base64 string
        }
      };
    }
  }

  return (
    <>
      <Modal
        title={existingEmployee ? 'Edit Profile' : 'Add an Employee'}
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
            onSubmit={(e) => {
              methods.handleSubmit(onSubmit)(e);
            }}
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
              {existingEmployee ? 'Save' : 'Add'}
            </Button>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
};

export default EmployeeModal;
