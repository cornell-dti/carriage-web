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
    const result: ObjectType = {};
    availability.forEach(({ startTime, endTime, days }) => {
      days.forEach((day: string) => {
        result[day] = { startTime, endTime };
      });
    });
    return result;
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
  const createOrUpdateDriver = async (
    driver: AdminData | DriverData,
    uid: string | '',
    isNewDriver = false
  ) => {
    if (isNewDriver) {
      return await createEmployee(
        uid,
        driver,
        '/api/drivers',
        () => refreshDrivers(),
        'Drivers'
      );
    } else {
      return await updateEmployee(
        uid,
        driver,
        '/api/drivers',
        () => refreshDrivers(),
        'Drivers'
      );
    }
  };

  const createOrUpdateAdmin = async (
    admin: AdminData,
    uid: string | '',
    isNewAdmin = false
  ) => {
    if (isNewAdmin) {
      await createEmployee(
        uid,
        admin,
        '/api/admins',
        () => refreshAdmins(),
        'Admins'
      );
    } else {
      await updateEmployee(
        uid,
        admin,
        '/api/admins',
        () => refreshAdmins(),
        'Admins'
      );
    }
  };
  async function createEmployee(
    id: string,
    employeeData: AdminData | DriverData,
    endpoint: string,
    refresh: () => Promise<void>,
    table: string
  ): Promise<any> {
    try {
      // Create the employee
      // HERE
      const { data: createdEmployee } = await axios.post(
        endpoint,
        employeeData
      );

      // Upload the photo if provided
      if (imageBase64 !== '') {
        await uploadEmployeePhoto(id || '', table, refresh, imageBase64);

        console.log('Photo uploaded successfully.');
      }

      // Refresh after successful creation and photo upload
      await refresh();

      showToast('The employee has been added.', ToastStatus.SUCCESS);
      return createdEmployee;
    } catch (error) {
      console.error('Error creating employee:', error);
      showToast('Failed to add the employee.', ToastStatus.ERROR);
      throw error;
    }
  }

  async function updateEmployee(
    id: string,
    employeeData: AdminData | DriverData,
    endpoint: string,
    refresh: () => Promise<void>,
    table: string
  ): Promise<any> {
    try {
      await axios.put(`${endpoint}/${id}`, employeeData);

      // Upload the photo if provided
      uploadEmployeePhoto(id || '', table, refresh, imageBase64);
      console.log('Photo uploaded successfully.');

      refresh();
      showToast('The employee has been edited.', ToastStatus.SUCCESS);
    } catch (error) {
      console.error('Error updating employee:', error);
      showToast('Failed to edit the employee.', ToastStatus.ERROR);
      throw error;
    }
  }

  async function deleteEmployee(
    id: string | undefined,
    emptype: 'drivers' | 'admins'
  ) {
    if (id === undefined) {
      console.log('Invalid/Null ID: deleteEmployee');
    } else {
      await axios.delete(`/api/${emptype}/${id}`);
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
    
    // Sort selectedRole array in reverse order: ['sds-admin', 'redrunner-admin', 'driver']
    selectedRole.sort().reverse();

   
    let iteration = 0;

    for (const employeeRole of selectedRole) {
      switch (employeeRole) {
        case 'sds-admin':
          if (iteration > 0) continue; 

          console.log('Handling sds-admin...');
          if (existingEmployee) {
            // Handle existing employee scenario for sds-admin
            if (existingEmployee.isDriver) {
              console.log('Switching from driver to sds-admin...');
              await deleteEmployee(existingEmployee.id, 'drivers');
              await createOrUpdateAdmin(admin, existingEmployee.id || '', false);
            } else {
              console.log('Updating existing sds-admin...');
              await createOrUpdateAdmin(admin, existingEmployee.id || '', false);
            }
          } else {
            // Handle new employee creation for sds-admin
            console.log('Creating new sds-admin...');
            await createOrUpdateAdmin(admin, '', true);
          }
          break;

        case 'redrunner-admin':
          if (iteration > 0) continue; // Don't create a duplicate

          console.log('Handling redrunner-admin...');
          if (existingEmployee) {
            // Handle existing employee scenario for redrunner-admin
            if (existingEmployee.isDriver) {
              console.log('Switching from driver to redrunner-admin...');
              await deleteEmployee(existingEmployee.id, 'drivers');
              await createOrUpdateAdmin(admin, existingEmployee.id || '', false);
            } else {
              console.log('Updating existing redrunner-admin...');
              await createOrUpdateAdmin(admin, existingEmployee.id || '', true);
            }
          } else {
            // Handle new employee creation for redrunner-admin
            console.log('Creating new redrunner-admin...');
            await createOrUpdateAdmin(admin, '', true);
          }
          break;

        case 'driver':
          if (existingEmployee) {
            if (existingEmployee.isDriver) {
              console.log('Updating existing driver...');
              await createOrUpdateDriver(driver, '', false);
            } else {
              console.log('Switching from admin to driver...');
              await deleteEmployee(existingEmployee.id, 'admins');
              await createOrUpdateDriver(
                driver,
                existingEmployee.id || '',
                true
              );
            }
          } else {
            console.log('Creating new driver...');
            await createOrUpdateDriver(driver, '', true);
          }
          break;

        default:
          console.log(`Unrecognized role: ${employeeRole}`);
          break;
      }
      iteration += 1; // Increment iteration to keep track of processed roles
      console.log(iteration)
    }

    console.log('Completed role processing');
    closeModal();
  }

  async function updateBase64(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();

    const { files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      console.log('Starting to read the file:', file.name);
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const base64 = reader.result?.toString().split(',')[1]; // Extract base64
        console.log(
          'File read successfully. Base64 extracted:',
          base64 ? base64.substring(0, 20) + '...' : 'No base64 data'
        );

        if (base64) {
          setImageBase64(base64); // Save the base64 string
          console.log('Set base64 data.');
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
    } else {
      console.error('No file selected.');
      alert('No file selected');
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
              console.log(e);
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
