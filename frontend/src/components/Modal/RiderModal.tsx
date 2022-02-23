import React, { useEffect, useState, useContext } from 'react';
import Modal from './Modal';
import { Link, Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { Button } from '../FormElements/FormElements';
import { ObjectType, Rider } from '../../types/index';
import Toast from '../ConfirmationToast/ConfirmationToast';
import RiderModalInfo from './RiderModalInfo';
import styles from './ridermodal.module.css';
import { useReq } from '../../context/req';
import { useRiders } from '../../context/RidersContext';
import { edit, trash, trashbig, red_trash } from '../../icons/other/index';
import AuthContext from '../../context/auth';

type RiderModalProps = {
  existingRider?: Rider;
  isRiderWeb?: boolean;
};

const RiderModal = ({ existingRider, isRiderWeb }: RiderModalProps) => {
  const { refreshUser } = useContext(AuthContext);
  const [formData, setFormData] = useState<ObjectType>({});
  const [isOpen, setIsOpen] = useState(false);
  const [deleteStudent, setDeleteStudent] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showingToast, setToast] = useState(false);
  const { withDefaults } = useReq();
  const { refreshRiders } = useRiders();
  const history = useHistory();

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
    if (deleteStudent) {
      fetch(
        `/api/riders/${!existingRider ? '' : existingRider.id}`,
        withDefaults({
          method: 'DELETE',
        })
      ).then(() => {
        setToast(true);
        refreshRiders;
        history.push('/riders');
      });
    }
  }, [deleteStudent]);
  useEffect(() => {
    if (isSubmitted) {
      fetch(
        `/api/riders/${!existingRider ? '' : existingRider.id}`,
        withDefaults({
          method: !existingRider ? 'POST' : 'PUT',
          body: JSON.stringify(formData),
        })
      ).then(() => {
        refreshRiders();
        setToast(true);
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
    withDefaults,
  ]);

  return (
    <>
      {showingToast ? (
        <Toast
          message={
            !existingRider
              ? 'The student has been added.'
              : 'The student has been edited.'
          }
        />
      ) : null}
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
