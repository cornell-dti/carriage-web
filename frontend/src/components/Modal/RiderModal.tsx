import React, { useEffect, useState, useContext } from 'react';
import Modal from './Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType, Rider } from '../../types/index';
import RiderModalInfo from './RiderModalInfo';
import styles from './ridermodal.module.css';
import { useReq } from '../../context/req';
import { useRiders } from '../../context/RidersContext';
import { edit } from '../../icons/other/index';
import AuthContext from '../../context/auth';
import { ToastStatus, useToast } from '../../context/toastContext';

type RiderModalProps = {
  existingRider?: Rider;
  isRiderWeb?: boolean;
};

const RiderModal = ({ existingRider, isRiderWeb }: RiderModalProps) => {
  const { refreshUser } = useContext(AuthContext);
  const [formData, setFormData] = useState<ObjectType>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showToast } = useToast();
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
    setIsSubmitted(true);
    closeModal();
  };

  useEffect(() => {
    if (isSubmitted) {
      fetch(
        `/api/riders/${!existingRider ? '' : existingRider.id}`,
        withDefaults({
          method: !existingRider ? 'POST' : 'PUT',
          body: JSON.stringify(formData)
        })
      ).then(() => {
        refreshRiders();
        console.log('yiee');
        showToast(
          `The student has been ${!existingRider ? 'added' : 'edited'}`,
          ToastStatus.SUCCESS
        );
        if (isRiderWeb) {
          refreshUser();
        }
      });
      setIsSubmitted(false);
    }
  }, [
    existingRider,
    formData,
    isRiderWeb,
    isSubmitted,
    refreshRiders,
    refreshUser,
    withDefaults
  ]);

  return (
    <>
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
