import React, { useEffect, useState, useContext } from 'react';
import Modal from './Modal';
import { ObjectType, Rider } from '../../types/index';
import RiderModalInfo from './RiderModalInfo';
import styles from './ridermodal.module.css';
import { useRiders } from '../../context/RidersContext';
import { edit, trash, trashbig, red_trash } from '../../icons/other/index';
import AuthContext from '../../context/auth';
import { ToastStatus, useToast } from '../../context/toastContext';
import axios from '../../util/axios';

type RiderModalProps = {
  existingRider?: Rider;
  isRiderWeb?: boolean;
  isOpen: boolean;
  setIsOpen: any;
};

const RiderModal = ({
  existingRider,
  isRiderWeb,
  isOpen,
  setIsOpen,
}: RiderModalProps) => {
  const { refreshUser } = useContext(AuthContext);
  const [formData, setFormData] = useState<ObjectType>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showToast } = useToast();
  const { refreshRiders } = useRiders();

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
      const method = existingRider ? axios.put : axios.post;
      method(
        `/api/riders/${!existingRider ? '' : existingRider.id}`,
        formData
      ).then(() => {
        refreshRiders();
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
  ]);

  return (
    <>
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
