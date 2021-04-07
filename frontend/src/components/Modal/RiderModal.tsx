import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import Modal from './Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType, NewRider } from '../../types/index';
import Toast from '../ConfirmationToast/ConfirmationToast';
import RiderModalInfo from './RiderModalInfo';
import styles from './ridermodal.module.css';
import { useReq } from '../../context/req';
import { useRiders } from '../../context/RidersContext';

type RiderModalProps = {
  riders: Array<NewRider>;
  setRiders: Dispatch<SetStateAction<NewRider[]>>;
}

const RiderModal = () => {
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    accessibility: [],
    description: '',
    joinDate: '',
    endDate: '',
    pronouns: '',
    address: '',
    favoriteLocations: [],
    organization: '',
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showingToast, setToast] = useState(false);
  const { withDefaults } = useReq();
  const { refreshRiders } = useRiders();

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const saveDataThen = (next: () => void) => (data: ObjectType) => {
    setFormData((prev) => ({ ...prev, ...data }));
    next();
  };

  const submitData = () => {
    setToast(false);
    setIsSubmitted(true);
    closeModal();
  };

  useEffect(() => {
    if (isSubmitted) {
      const newRider = {
        id: formData.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        accessibility: formData.accessibility,
        description: '',
        joinDate: '',
        pronouns: '',
        address: formData.address,
        favoriteLocations: [],
        organization: '',
      };
      fetch('/api/riders', withDefaults({
        method: 'POST',
        body: JSON.stringify(newRider),
      })).then(() => refreshRiders());
      setIsSubmitted(false);
      setToast(true);
    }
  }, [formData, isSubmitted, refreshRiders, withDefaults]);

  return (
    <>
      {showingToast ? <Toast message='Ride has been added.' /> : null}
      <Button className={styles.addRiderButton} onClick={openModal}>+ Add Student</Button>
      <Modal
        title={['Add a student']}
        isOpen={isOpen}
        currentPage={0}
        onClose={closeModal}
      >
        <RiderModalInfo onSubmit={saveDataThen(submitData)} />
      </Modal>
    </>
  );
};

export default RiderModal;
