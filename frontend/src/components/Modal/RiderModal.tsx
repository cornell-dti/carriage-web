import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import Modal from './Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType, Rider } from '../../types/index';
import RiderModalInfo from './RiderModalInfo';


type RiderModalProps = {
  riders: Array<Rider>;
  setRiders: Dispatch<SetStateAction<Rider[]>>;
}

function addRider(newRider: Rider, allRiders: Rider[]) {
  async function addBackend() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: newRider.firstName,
        lastName: newRider.lastName,
        phoneNumber: newRider.phoneNumber,
        email: newRider.email,
        accessibilityNeeds: newRider.accessibilityNeeds,
        description: newRider.description,
        joinDate: newRider.joinDate,
        pronouns: newRider.pronouns,
        address: newRider.address,
      }),
    };
    await fetch('/riders', requestOptions);
  }
  addBackend();
  return [...allRiders, newRider];
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
      console.log(formData);
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
      setRiders(addRider(newRider, riders));
    }
  }, [formData, isSubmitted, riders, setRiders]);

  return (
    <>
      <Button onClick={openModal}>+ Add ride</Button>
      <Modal
        title={['Add a Student']}
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
