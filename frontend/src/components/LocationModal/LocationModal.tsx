import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useReq } from '../../context/req';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType, Location } from '../../types/index';
import EmployeeInfo from './EmployeeInfo';
import RoleSelector from './RoleSelector';
import WorkingHours from './WorkingHours';
import Toast from '../ConfirmationToast/ConfirmationToast';
import Upload from './Upload';
import styles from './locationmodal.module.css';
import { useEmployees } from '../../context/EmployeesContext';
import { edit } from '../../icons/other/index';

type LocationModalProps = {
  existingLocation?: Location
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

const LocationModal = ({ existingLocation }: LocationModalProps) => {
  // const [selectedRole, setSelectedRole] = useState(
  //   existingLocation?.role ? existingLocation?.role : 'driver',
  // );
  // const [imageBase64, setImageBase64] = useState('');
  // const { refreshAdmins, refreshDrivers } = useEmployees();

  const [isOpen, setIsOpen] = useState(false);
  const [showingToast, setToast] = useState(false);
  const { withDefaults } = useReq();
  const methods = useForm();

  const modalTitle = existingLocation ? 'Edit Location' : 'Add a Location';
  const submitButtonText = existingLocation ? 'Save' : 'Add';

  const openModal = () => {
    setIsOpen(true);
    setToast(false);
  };

  const closeModal = () => setIsOpen(false);

  const onSubmit = async (data: ObjectType) => {
    const url = existingLocation
      ? `/api/location/${existingLocation!.id}`
      : '/api/location';
    const method = existingLocation
      ? 'PUT'
      : 'POST';

    fetch(url, withDefaults({
      method,
      body: JSON.stringify(data),
    }));
    setToast(true);
    closeModal();
  };

  return (
    <>
      {
        existingLocation
          ? <img className={styles.edit} alt="edit" src={edit} onClick={openModal} />
          : <Button onClick={openModal}>+ Add a location</Button>
      }
      {showingToast ? <Toast message={existingLocation ? 'Location has been updated.' : 'Location has been added.'} /> : null}
      <Modal
        title={modalTitle}
        isOpen={isOpen}
        onClose={closeModal}
      >
        <FormProvider {...methods} >
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            {/* <EmployeeInfo
              name={existingLocation?.name}
              netId={existingLocation?.netId}
              email={existingLocation?.email}
              phone={existingLocation?.phone}
            />
            {
              selectedRole === 'admin' ? null
                : <WorkingHours
                  existingAvailability={existingLocation?.availability}
                />
            }
            <RoleSelector
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
            /> */}
            <Button className={styles.submit} type='submit'>
              {submitButtonText}
            </Button>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
};

export default LocationModal;
