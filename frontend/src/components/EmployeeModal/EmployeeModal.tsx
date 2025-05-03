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
    netId?: string;
    email?: string;
    phone?: string;
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
  email: any;
  phoneNumber: any;
};

type DriverData = {
  id?: string;
  firstName: any;
  lastName: any;
  email: any;
  phoneNumber: any;
};

/**
 * Type guard to check if an employee is an Admin.
 * @param employee - The employee object to check.
 * @returns True if the employee is an Admin.
 */
function isAdmin(employee: any): boolean {
  return 'type' in employee;
}

/**
 * Type guard to check if an employee is a Driver.
 * @param employee - The employee object to check.
 * @returns True if the employee is a Driver.
 */
function isDriver(employee: any): boolean {
  return !isAdmin(employee);
}

const EmployeeModal = ({
  existingEmployee,
  isOpen,
  setIsOpen,
}: EmployeeModalProps) => {
  const { showToast } = useToast();

  const pathname = window.location.pathname;
  const isAdminPage = pathname.startsWith('/admin');
  const isDriverPage = pathname.startsWith('/driver');

  const allowedRoles = isAdminPage ? ['admin', 'driver'] : ['driver'];

  const [selectedRole, setSelectedRole] = useState<string[]>(
    existingEmployee?.type
      ? existingEmployee.type.filter((r) => allowedRoles.includes(r))
      : [allowedRoles[0]]
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
   * Uploads a photo for a given employee to the backend.
   * @param employeeId - The ID of the employee.
   * @param table - The name of the database table ("Admins" or "Drivers").
   * @param refresh - A callback to refresh the UI after upload.
   * @param isCreate - Whether this upload is for a newly created employee (used for conditional feedback).
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
   * Creates a new employee (Admin or Driver) in the database.
   * If a photo is provided, it will also be uploaded.
   * @param employeeData - The data for the new employee.
   * @param endpoint - The API endpoint to post the data to.
   * @param refresh - Callback to refresh the UI after creation.
   * @param table - The table name for photo upload.
   * @returns The Axios response from the creation request.
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
    return res;
  };

  /**
   * Updates an existing employee's data and uploads a new photo if provided.
   * @param employeeData - The updated employee information.
   * @param endpoint - The API endpoint to send the PUT request to.
   * @param refresh - Callback to refresh the UI after update.
   * @param table - The table name for photo upload.
   * @returns The updated employee data.
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
    if (imageBase64 !== '') {
      uploadPhotoForEmployee(updatedEmployee.id, table, refresh, false);
    }
    return updatedEmployee;
  };

  /**
   * Creates or updates a driver, depending on the isNewDriver flag.
   * @param driver - Driver data to be created or updated.
   * @param isNewDriver - True if creating a new driver, false if updating.
   * @returns The result of the create or update operation.
   */
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

  /**
   * Creates or updates an admin, depending on the isNewAdmin flag.
   * @param admin - Admin data to be created or updated.
   * @param isNewAdmin - True if creating a new admin, false if updating.
   */
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

  /**
   * Deletes a driver by their ID.
   * @param id - The ID of the driver to delete.
   */
  const deleteDriver = async (id: string | undefined) => {
    await axios.delete(`/api/drivers/${id}`);
  };

  /**
   * Deletes an admin by their ID.
   * @param id - The ID of the admin to delete.
   */
  const deleteAdmin = async (id: string | undefined) => {
    await axios.delete(`/api/admins/${id}`);
  };

  const onSubmit = async (data: ObjectType) => {
    const { firstName, lastName, netid, phoneNumber, startDate } = data;

    const driver = {
      firstName,
      lastName,
      email: netid + '@cornell.edu',
      phoneNumber,
      startDate,
    };

    const admin = {
      firstName,
      lastName,
      email: netid + '@cornell.edu',
      type: selectedRole.filter((role) => !(role === 'driver')),
      phoneNumber,
    };

    const existingDriver = isDriver(existingEmployee);
    const existingAdmin = isAdmin(existingEmployee);

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

            {/* <WorkingHours
              existingAvailability={existingEmployee?.availability}
              hide={false}
            /> */}
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
