import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import Modal from './Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType, NewRider } from '../../types/index';
import RiderModalInfo from './RiderModalInfo';
import styles from './ridermodal.module.css';
import { useReq } from '../../context/req';


type RiderModalProps = {
  riders: Array<NewRider>;
  setRiders: Dispatch<SetStateAction<NewRider[]>>;
}

const RiderModal = ({ riders, setRiders }: RiderModalProps) => {
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    accessibility: [],
    description: '',
    joinDate: '',
    pronouns: '',
    address: '',
    favoriteLocations: [],
    organization: ''
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { withDefaults } = useReq();

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const saveDataThen = (next: () => void) => (data: ObjectType) => {
    setFormData((prev) => ({ ...prev, ...data }));
    next();
  };

  const submitData = () => {
    setIsSubmitted(true);
    closeModal();
  };

  useEffect(() => {
    if (isSubmitted) {
      setIsSubmitted(false);
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
        organization: ''
      };
      const addRider = async () => {
        await fetch('/api/riders', withDefaults({
          method: 'POST',
          body: JSON.stringify(newRider),
        }));
      };
      addRider();
      setRiders([...riders, newRider]);
    }
  }, [formData, isSubmitted, riders, setRiders, withDefaults]);

  return (
    <>
      <Button className={styles.addRiderButton} onClick={openModal}>+ Add Rider</Button>
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
