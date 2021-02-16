import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import Modal from './Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType, Rider } from '../../types/index';
import RiderModalInfo from './RiderModalInfo';
import styles from './ridermodal.module.css';
import { useReq } from '../../context/req';

type RiderModalProps = {
  riders: Array<Rider>;
  setRiders: Dispatch<SetStateAction<Rider[]>>;
}

const RiderModal = ({ riders, setRiders }: RiderModalProps) => {
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    accessibilityNeeds: [],
    description: '',
    joinDate: '',
    pronouns: '',
    address: '',
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
        accessibilityNeeds: formData.accessibilityNeeds,
        description: '',
        joinDate: '',
        pronouns: '',
        address: formData.address,
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
        title={['Add a Rider']}
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
