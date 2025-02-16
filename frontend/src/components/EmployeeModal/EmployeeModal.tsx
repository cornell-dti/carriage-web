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
 * Creates a new employee using the provided data and endpoint. Optionally uploads a photo if
 * [iteration] is 0 and [imageBase64] is non-empty.
 * 
 * @param id - The unique identifier of the employee to create, or an empty string if not provided.
 * @param employeeData - The data to create the new employee with. This should be a valid object.
 * @param endpoint - The API endpoint to which the employee data will be sent.
 * @param refresh - A function that refreshes the employee data or table after the creation.
 * @param iteration - A non-negative integer used to conditionally upload a photo.
 * @param imageBase64 - A base64 encoded string representing the employee's photo (optional).
 * 
 * @returns A promise that resolves to the created employee data.
 * 
 * @throws {Error} Throws an error if any of the parameters are invalid or if the creation fails.
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
 * Updates an existing employee's data using the specified endpoint. Optionally uploads a photo
 * if [iteration] is 0 and [imageBase64] is non-empty.
 * 
 * @param  id - The unique identifier of the employee to update.
 * @param  employeeData - The data to update the employee with. This should be a valid object.
 * @param  endpoint - The API endpoint to which the employee data will be sent.
 * @param  refresh - A function that refreshes the employee data or table after the update.
 * @param  iteration - A non-negative integer used to conditionally upload a photo.
 * @param  imageBase64 - A base64 encoded string representing the employee's photo (optional).
 * 
 * @returns  A promise that resolves after successfully updating the employee and refreshing
 * the data.
 * 
 * @throws {Error} Throws an error if any of the parameters are invalid or if the update fails.
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
 * 
 * @param id - The unique identifier of the employee to delete.
 * @param emptype - The type of employee, either 'drivers' or 'admins'.
 * 
 * @returns A promise that resolves after successfully deleting the employee.
 * 
 * @throws {Error} Throws an error if the id is not a valid string or the emptype is not 'drivers' or 'admins'.
 */
  async function deleteEmployee(id: string, emptype: 'drivers' | 'admins') {
    await axios.delete(`/api/${emptype}/${id}`);
  }

/**
 * Processes and assigns roles ('driver', 'admin') for an employee, handling creation, 
 * updating, or deletion of their information as needed.
 * 
 * @param selectedRole - Valid array of roles to assign.
 * @param existingEmployee - Existing employee data object or `null` (if new).
 * @param admin - Valid employee data object for the 'admin' role.
 * @param driver - Valid employee data object for the 'driver' role.
 * @returns A promise that resolves when all role processing is complete.
 * @throws {Error} If input parameters fail validation (invalid types or structure).
 * 
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
