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

enum DayOfWeek {
  MONDAY = 'MON',
  TUESDAY = 'TUE',
  WEDNESDAY = 'WED',
  THURSDAY = 'THURS',
  FRIDAY = 'FRI',
}

type AdminData = {
  type: string[];
  isDriver: boolean;
};

type DriverData = {
  availability: DayOfWeek[];
  startDate: string;
};

//normalized type
type EmployeeEntity = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  netId: string;
  email: string;
  driver?: DriverData;
  admin?: AdminData;
  photoLink?: string;
};

// both for formating to current api data expections
function extractAdminData(employeeData: EmployeeEntity) {
  return {
    firstName: employeeData.firstName,
    lastName: employeeData.lastName,
    type: employeeData.admin?.type,
    isDriver: employeeData.admin?.isDriver,
    phoneNumber: employeeData.phoneNumber,
    email: employeeData.email,
    photoLink: employeeData.photoLink,
  };
}

function extractDriverData(employeeData: EmployeeEntity) {
  return {
    firstName: employeeData.firstName,
    lastName: employeeData.lastName,
    availability: employeeData.driver?.availability,
    phoneNumber: employeeData.phoneNumber,
    startDate: employeeData.driver?.startDate,
    email: employeeData.email,
    photoLink: employeeData.photoLink,
  };
}

type EmployeeModalProps = {
  existingEmployee: EmployeeEntity | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const EmployeeModal = ({
  existingEmployee,
  isOpen,
  setIsOpen,
}: EmployeeModalProps) => {
  const { showToast } = useToast();
  const { refreshAdmins, refreshDrivers } = useEmployees();
  const [selectedRoles, setSelectedRole] = useState<string[]>([]);
  const [imageBase64, setImageBase64] = useState('');
  const methods = useForm();

  const closeModal = () => {
    methods.clearErrors();
    setIsOpen(false);
  };

  /**
   * Uploads an employee's photo (in base64 format) to the backend.
   *
   * @param employeeId - The ID of the employee whose photo is being uploaded.
   * @param table - The name of the table (used for determining where to store the photo).
   * @param imageBase64 - The photo image data in base64 format.
   * @returns A promise that resolves when the photo is successfully uploaded.
   */

  async function uploadEmployeePhoto(
    employeeId: string,
    table: string,
    imageBase64: string
  ): Promise<void> {
    try {
      await axios.post('/api/upload/', {
        id: employeeId,
        tableName: table,
        fileBuffer: imageBase64,
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  }

  /**
   * Sends the employee role data to the backend for creation and returns the new employee ID.
   *
   * @param employeeData - The employee entity containing the details to be created.
   * @param endpoint - The API endpoint, either `/api/admins` or `/api/drivers`.
   * @returns A promise resolving to the newly created employee ID.
   */

  async function createEmployee(
    employeeData: EmployeeEntity,
    endpoint: '/api/admins' | '/api/drivers'
  ): Promise<EmployeeEntity> {
    let res: any;
    switch (endpoint) {
      case '/api/drivers':
        const {
          data: { data: createdDriver },
        } = await axios.post(endpoint, {
          ...extractDriverData(employeeData),
          eid: employeeData.id || '',
        });
        res = createdDriver;
        break;
      case '/api/admins':
        const {
          data: { data: createdAdmin },
        } = await axios.post(endpoint, {
          ...extractAdminData(employeeData),
          eid: employeeData.id || '',
        });
        res = createdAdmin;
        break;
      default:
        break;
    }
    return res;
  }

  /**
   * Sends the updated employee role data to the backend and returns the updated employee.
   *
   * @param employeeData - The employee entity containing updated data.
   * @param endpoint - The API endpoint, either `/api/admins` or `/api/drivers`.
   * @returns A promise resolving to the updated employee entity.
   */
  async function updateEmployee(
    employeeData: EmployeeEntity,
    endpoint: '/api/admins' | '/api/drivers'
  ): Promise<EmployeeEntity> {
    let res: any;
    switch (endpoint) {
      case '/api/drivers':
        const {
          data: { data: updatedDriver },
        } = await axios.put(
          `${endpoint}/${employeeData.id}`,
          extractDriverData(employeeData)
        );
        res = updatedDriver;
        break;
      case '/api/admins':
        const {
          data: { data: updatedAdmin },
        } = await axios.put(
          `${endpoint}/${employeeData.id}`,
          extractDriverData(employeeData)
        );
        res = updatedAdmin;
        break;
      default:
        break;
    }
    return res; // Return the updated employee data, remove double nested later
  }

  /**
   * Deletes an employee role entry from the backend.
   *
   * @param id - The ID of the employee to be deleted.
   * @param endpoint - The API endpoint to delete from.
   * @returns A promise that resolves when the deletion is complete.
   */
  async function deleteEmployee(id: string, endpoint: string): Promise<void> {
    await axios.delete(`${endpoint}/${id}`);
  }

  /**
   * Processes the selected roles:
   * - If no employee exists, creates one using the primary selected role.
   * - If the employee exists, updates or adds the appropriate roles.
   * - Deletes roles if they are no longer selected.
   *
   * @param selectedRoles - Array of roles from the form.
   * @param existingEmployee - Existing employee data or null.
   * @returns The updated or newly created employee entity.
   */
  async function processRoles(
    selectedRoles: string[],
    employeeData: EmployeeEntity
  ): Promise<string> {
    const hasAdmin =
      selectedRoles.includes('sds-admin') ||
      selectedRoles.includes('redrunner-admin');
    const hasDriver = selectedRoles.includes('driver');

    let currentId = employeeData.id;
    // If no employee exists, create one using a primary role.
    if (!currentId || currentId === '') {
      if (hasAdmin) {
        employeeData.id = (
          await createEmployee(employeeData, '/api/admins')
        ).id;
        showToast(
          `Created a new employee with the admin role`,
          ToastStatus.SUCCESS
        );
      }
      if (hasDriver) {
        employeeData.id = (
          await createEmployee(employeeData, '/api/drivers')
        ).id;
        showToast(
          `Created a new employee with the driver role`,
          ToastStatus.SUCCESS
        );
      }
    } else {
      if (hasAdmin) {
        if (employeeData.admin) {
          await updateEmployee(employeeData, '/api/admins');
        } else {
          await createEmployee(employeeData, '/api/admins');
        }
      } else if (employeeData.admin) {
        await deleteEmployee(employeeData.id, '/api/admins');
      }

      if (hasDriver) {
        if (employeeData.driver) {
          await updateEmployee(employeeData, '/api/drivers');
        } else {
          await createEmployee(employeeData, '/api/drivers');
        }
      } else if (employeeData.driver) {
        await deleteEmployee(employeeData.id, '/api/drivers');
      }
    }
    let id = employeeData.id;
    if (!hasAdmin && !hasDriver) {
      return '';
    }
    return id;
  }

  /**
   * Handles form submission.
   *
   * - Constructs payloads for both driver and admin roles.
   * - Sends the data to the backend via processRoles().
   * - If a photo was uploaded, sends the photo to the backend afterward.
   *
   * @param formData - The data received from the form/modal.
   * @param photo - The optional photo file uploaded by the user.
   */
  async function onSubmit(formData: any) {
    // Data entered from the form/modal.
    const hasAdmin =
      selectedRoles.includes('sds-admin') ||
      selectedRoles.includes('redrunner-admin');
    const hasDriver = selectedRoles.includes('driver');

    let admin_data: AdminData | null = null;
    let driver_data: DriverData | null = null;

    if (hasAdmin) {
      admin_data = {
        type: selectedRoles.filter((role) => role !== 'driver'),
        isDriver: hasDriver,
      };
    }

    if (hasDriver) {
      driver_data = {
        availability: formData.availability || [],
        startDate: formData.startDate,
      };
    }

    const employeeData: EmployeeEntity = {
      id: existingEmployee?.id || '',
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      netId: formData.netid,
      email: `${formData.netid}@cornell.edu`,
      driver: driver_data || undefined,
      admin: admin_data || undefined,
    };
    try {
      // Process roles: data is sent to the backend endpoints here.
      const id = await processRoles(selectedRoles, employeeData);
      // If a photo was uploaded, send it to the backend.
      if (imageBase64 && id !== '') {
        // Decide which table to update based on role selection (to be changed at a later date.)
        const targetTable =
          selectedRoles.includes('sds-admin') ||
          selectedRoles.includes('redrunner-admin')
            ? 'Admins'
            : 'Drivers';
        await uploadEmployeePhoto(id, targetTable, imageBase64);
      }

      // Refresh both admin and driver data once after processing.
      await refreshAdmins();
      await refreshDrivers();

      showToast(`Employee information processed`, ToastStatus.SUCCESS);
    } catch (error) {
      showToast('An error occurred: ', ToastStatus.ERROR);
    } finally {
      closeModal();
    }
  }
  // -------------------------------
  // PHOTO FILE INPUT HANDLER
  // -------------------------------
  // This function handles the photo file input change event.
  async function updateBase64(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    const { files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result?.toString().split(',')[1];
        if (base64) {
          setImageBase64(base64);
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
        {/* Photo upload component – data enters here */}
        <Upload
          imageChange={updateBase64}
          existingPhoto={
            existingEmployee?.photoLink
              ? `${existingEmployee?.photoLink}?t=${new Date().getTime()}`
              : ''
          }
        />

        <FormProvider {...methods}>
          <form
            onSubmit={(e) => methods.handleSubmit(onSubmit)(e)}
            aria-labelledby="employee-modal"
          >
            <EmployeeInfo
              firstName={existingEmployee?.firstName}
              lastName={existingEmployee?.lastName}
              netId={existingEmployee?.netId}
              phone={existingEmployee?.phoneNumber}
            />

            {(selectedRoles.includes('driver') ||
              existingEmployee?.driver?.availability) && (
              <>
                <StartDate existingDate={existingEmployee?.driver?.startDate} />
                <WorkingHours
                  existingAvailability={existingEmployee?.driver?.availability}
                  hide={false}
                />
              </>
            )}

            <RoleSelector
              selectedRoles={selectedRoles}
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
