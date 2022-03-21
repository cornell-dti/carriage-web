import React, { useEffect, useState, useContext } from 'react';
import cn from 'classnames';
import Toast from '../ConfirmationToast/ConfirmationToast';
import { useReq } from '../../context/req';
import RiderModal from '../Modal/RiderModal';
import RiderModalInfo from '../Modal/RiderModalInfo';
import styles from './userDetail.module.css';
import {
  edit,
  detailTrash,
  red_trash,
  edit_icon,
} from '../../icons/other/index';
import EmployeeModal from '../EmployeeModal/EmployeeModal';
import ConfirmationModal from '../Modal/ConfirmationModal';
import Modal from '../Modal/Modal';
import { ObjectType, Rider } from '../../types/index';
import { Button } from '../FormElements/FormElements';
import { useRiders } from '../../context/RidersContext';
import AuthContext from '../../context/auth';
import { Route, Switch, useHistory } from 'react-router-dom';

type otherInfo = {
  children: JSX.Element | JSX.Element[];
};

export const OtherInfo = ({ children }: otherInfo) => (
  <div className={styles.otherInfoContainer}>{children}</div>
);

type UserContactInfo = {
  icon: string;
  alt: string;
  text: string;
};

export const UserContactInfo = ({ icon, alt, text }: UserContactInfo) => (
  <div className={styles.contactInfo}>
    <img className={styles.contactIcon} src={icon} alt={alt} />
    <p className={styles.contactText}>{text}</p>
  </div>
);

type EmployeeDetailProps = {
  id: string;
  firstName: string;
  lastName: string;
  netId: string;
  phone: string;
  availability?: string[][];
  admin?: boolean;
  photoLink?: string;
  startDate?: string;
};

type UserDetailProps = {
  firstName: string;
  lastName: string;
  netId: string;
  children: React.ReactNode;
  employee?: EmployeeDetailProps;
  role?: string;
  photoLink?: string;
  isRider?: boolean;
  rider?: Rider;
};

const UserDetail = ({
  firstName,
  lastName,
  netId,
  children,
  employee,
  role,
  photoLink,
  isRider,
  rider,
}: UserDetailProps) => {
  const fullName = `${firstName} ${lastName}`;
  const [isShowing, setIsShowing] = useState(false);
  const { refreshUser } = useContext(AuthContext);
  const [showingToast, setToast] = useState(false);
  const [formData, setFormData] = useState<ObjectType>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { withDefaults } = useReq();
  const { refreshRiders } = useRiders();
  const [confirmationModalisOpen, setConfirmationModalisOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const openConfirmationModal = () => {
    setConfirmationModalisOpen(true);
  };

  const submitData = () => {
    setToast(false);
    setIsSubmitted(true);
    closeModal();
  };

  const saveDataThen = (next: () => void) => (data: ObjectType) => {
    setFormData((prev) => ({ ...prev, ...data }));
    next();
  };

  const closeConfirmationModal = () => {
    setConfirmationModalisOpen(false);
  };

  const toggleActive = (): void => {
    if (rider) {
      const { id, active } = rider;
      fetch(
        `/api/riders/${id}`,
        withDefaults({
          method: 'PUT',
          body: JSON.stringify({ active: !active }),
        })
      ).then(() => {
        setIsShowing(true);
        refreshRiders();
      });
    }
  };
  useEffect(() => {
    if (isSubmitted) {
      fetch(
        `/api/riders/${!rider ? '' : rider.id}`,
        withDefaults({
          method: 'PUT',
          body: JSON.stringify(formData),
        })
      ).then(() => {
        refreshRiders();
        setToast(true);
        if (isRider) {
          refreshUser();
        }
      });
      setIsSubmitted(false);
    }
  }, [
    rider,
    formData,
    isRider,
    isSubmitted,
    refreshRiders,
    refreshUser,
    withDefaults,
  ]);

  return (
    <div className={cn(styles.userDetail, { [styles.rider]: isRider })}>
      {isShowing && rider ? (
        <Toast
          message={`Rider ${rider.active ? 'deactivated' : 'activated'}.`}
        />
      ) : null}
      {showingToast ? <Toast message={'The student has been edited.'} /> : null}
      <div className={styles.imgContainer}>
        {photoLink && photoLink !== '' ? (
          <img
            className={styles.profilePic}
            src={`https://${photoLink}`}
            alt="profile"
          />
        ) : null}
      </div>
      <div className={styles.basicInfoContainer}>
        <div className={styles.basicInfoTop}>
          <div className={styles.nameInfoContainer}>
            <h1 className={styles.name}>{fullName}</h1>
            <p className={styles.netId}>{netId}</p>
          </div>
          <div className={styles.userEditContainer}>
            {rider && !isRider ? (
              <Button onClick={toggleActive}>
                {rider.active ? 'Deactivate' : 'Activate'}
              </Button>
            ) : null}
            {employee ? (
              <EmployeeModal
                existingEmployee={{
                  id: employee.id,
                  firstName: employee.firstName,
                  lastName: employee.lastName,
                  netId: employee.netId,
                  email: `${employee.netId}@cornell.edu`,
                  phone: employee.phone.replaceAll('-', ''), // remove dashes'-'
                  availability: employee.availability,
                  role,
                  photoLink: employee.photoLink,
                  startDate: employee.startDate,
                }}
              />
            ) : (
              <RiderModal existingRider={rider} isRiderWeb={isRider} />
            )}
            <button className={styles.edit_button} onClick={openModal}>
              <img className={styles.edit_icon} alt="edit" src={edit_icon} />
            </button>
            <button className={styles.back_div} onClick={openConfirmationModal}>
              <img className={styles.trashIcon} alt="trash" src={red_trash} />
            </button>
            <ConfirmationModal
              open={confirmationModalisOpen}
              rider={rider}
              onClose={closeConfirmationModal}
            />
            <Modal
              title={'Edit a Student'}
              isOpen={isOpen}
              currentPage={0}
              onClose={closeModal}
            >
              <RiderModalInfo
                onSubmit={saveDataThen(submitData)}
                setIsOpen={setIsOpen}
                setFormData={setFormData}
                rider={rider}
              />
            </Modal>
          </div>
        </div>
        <div className={styles.contactInfoContainer}>{children}</div>
      </div>
    </div>
  );
};

export default UserDetail;
