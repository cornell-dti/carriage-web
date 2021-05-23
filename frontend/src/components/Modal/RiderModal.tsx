import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType, Rider } from '../../types/index';
import Toast from '../ConfirmationToast/ConfirmationToast';
import RiderModalInfo from './RiderModalInfo';
import styles from './ridermodal.module.css';
import { useReq } from '../../context/req';
import { useRiders } from '../../context/RidersContext';
import { edit } from '../../icons/other/index';

type RiderModalProps = {
  existingRider?: Rider;
};

const RiderModal = ({ existingRider }: RiderModalProps) => {
  const [formData, setFormData] = useState<ObjectType>({});
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
      fetch(
        `/api/riders/${!existingRider ? '' : existingRider.id}`,
        withDefaults({
          method: !existingRider ? 'POST' : 'PUT',
          body: JSON.stringify(formData),
        }),
      ).then(() => {
        refreshRiders();
        setToast(true);
      });
      setIsSubmitted(false);
    }
  }, [existingRider, formData, isSubmitted, refreshRiders, withDefaults]);

  return (
    <>
      {showingToast
        ? <Toast
          message={!existingRider
            ? 'The student has been added.'
            : 'The student has been edited.'}
        />
        : null}
      {!existingRider ? (
        <Button className={styles.addRiderButton} onClick={openModal}>
          + Add Student
        </Button>
      ) : (
        <button className={styles.editRiderButton} onClick={openModal}>
          <img className={styles.editIcon} alt="edit" src={edit} />
        </button>
      )}
      <Modal
        title={!existingRider ? 'Add a Student' : 'Edit a Student'}
        isOpen={isOpen}
        currentPage={0}
        onClose={closeModal}
      >
        <RiderModalInfo
          onSubmit={saveDataThen(submitData)}
          setIsOpen={setIsOpen}
          setFormData={setFormData}
          rider={existingRider}
        />
      </Modal>
    </>
  );
};

export default RiderModal;
