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
      console.log('Uploading photo for employee:', employeeId);

      // Make the photo upload request
      await axios.post('/api/upload', photoData);

      console.log('Photo uploaded successfully.');

      // Refresh after the upload is complete
      //await refresh();
    } catch (error) {
      console.error('Error uploading photo:', error);

      // Show a toast notification for the failure (optional)
      showToast('Failed to upload the photo.', ToastStatus.ERROR);

      // Optionally throw the error to propagate it if needed
      throw error;
    }
  }

  async function createEmployee(
    employeeData: AdminData | DriverData,
    endpoint: string,
    refresh: () => Promise<void>,
    table: string
  ): Promise<any> {
    try {
      // Create the employee
      const { data: createdEmployee } = await axios.post(
        endpoint,
        employeeData
      );

      // Upload the photo if provided
      if (imageBase64) {
        await uploadEmployeePhoto(
          createdEmployee.id || '',
          table,
          refresh,
          imageBase64
        );
        console.log('Photo uploaded successfully.');
      }

      // Refresh after successful creation and photo upload
      //await refresh();

      showToast('The employee has been added.', ToastStatus.SUCCESS);

      return createdEmployee;
    } catch (error) {
      console.error('Error creating employee:', error);
      showToast('Failed to add the employee.', ToastStatus.ERROR);
      throw error;
    }
  }

  async function updateEmployee(
    employeeData: AdminData | DriverData,
    endpoint: string,
    refresh: () => Promise<void>,
    table: string
  ): Promise<any> {
    try {
      // Update the employee
      const { data: updatedEmployee } = await axios.put(
        `${endpoint}/${existingEmployee!.id}`,
        employeeData
      );

      // Upload the photo if provided
      if (imageBase64) {
        await uploadEmployeePhoto(
          employeeData?.id || '',
          table,
          refresh,
          imageBase64
        );
        console.log('Photo uploaded successfully.');
      }

      //await refresh();
      showToast('The employee has been edited.', ToastStatus.SUCCESS);
      return updatedEmployee;
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
    console.log(selectedRole)
    console.log("console log is here")
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

    const existingDriver = existingEmployee?.isDriver === true;
    const existingAdmin = existingEmployee?.isDriver === false;
    
    switch (true) {
      case existingEmployee &&
        selectedRole.includes('driver') &&
        selectedRole.includes('admins'):
        if (existingDriver && existingAdmin) {
          await updateEmployee(
            driver,
            '/api/drivers',
            refreshDrivers,
            'drivers'
          );
          await updateEmployee(admin, '/api/admins', refreshAdmins, 'admins');
        } else if (existingDriver) {
          await updateEmployee(
            driver,
            '/api/drivers',
            refreshDrivers,
            'drivers'
          );
          await createEmployee(
            { ...admin, id: existingEmployee.id },
            '/api/admins',
            refreshAdmins,
            'admins'
          );
        } else if (existingAdmin) {
          await createEmployee(
            { ...driver, id: existingEmployee.id },
            '/api/drivers',
            refreshDrivers,
            'drivers'
          );
          await updateEmployee(admin, '/api/admins', refreshAdmins, 'admins');
        }
        break;

      case existingEmployee && selectedRole.includes('driver'):
        if (existingDriver && existingAdmin) {
          await updateEmployee(
            driver,
            '/api/drivers',
            refreshDrivers,
            'drivers'
          );
          await deleteEmployee(existingEmployee?.id, 'admins');
        } else if (existingDriver) {
          await updateEmployee(
            driver,
            '/api/Drivers',
            refreshDrivers,
            'drivers'
          );
        } else if (existingAdmin) {
          await createEmployee(
            { ...driver, id: existingEmployee.id },
            '/api/drivers',
            refreshDrivers,
            'drivers'
          );
          await deleteEmployee(existingEmployee?.id, 'admins');
        }
        break;

      case existingEmployee && selectedRole.includes('admin'):
        if (existingDriver && existingAdmin) {
          await deleteEmployee(existingEmployee?.id, 'drivers');
          await updateEmployee(admin, '/api/admins', refreshAdmins, 'admins');
        } else if (existingDriver) {
          await deleteEmployee(existingEmployee?.id, 'drivers');
          await createEmployee(
            { ...admin, id: existingEmployee.id },
            '/api/admins',
            refreshAdmins,
            'admins'
          );
        }
        break;

      default:
        if (selectedRole.includes('driver') && selectedRole.includes('admin')) {
          const id = (
            await createEmployee(
              driver,
              '/api/drivers',
              refreshDrivers,
              'drivers'
            )
          ).id;
          await createEmployee(
            { ...admin, id },
            '/api/admins',
            refreshAdmins,
            'admins'
          );
        } else if (selectedRole.includes('driver')) {
          await createEmployee(
            driver,
            '/api/drivers',
            refreshDrivers,
            'drivers'
          );
        } else if (selectedRole.includes('admin')) {
          await createEmployee(admin, '/api/admins', refreshAdmins, 'admins');
        }
        break;
    }
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
          console.error('Set base64 data.');
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
              console.log('Form Event:', e);
              methods.handleSubmit(onSubmit);
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
            <Button
              className={styles.submit}
              type="submit"
              onClick={(e) => console.log(e)}
            >
              {existingEmployee ? 'Save' : 'Add'}
            </Button>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
};

export default EmployeeModal;
