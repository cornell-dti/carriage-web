import React, { useState, useContext } from 'react';
import cn from 'classnames';
import Toast from '../ConfirmationToast/ConfirmationToast';
import { useReq } from '../../context/req';
import RiderModal from '../Modal/RiderModal';
import styles from './userDetail.module.css';
import { red_trash } from '../../icons/other/index';
import EmployeeModal from '../EmployeeModal/EmployeeModal';
import ConfirmationModal from '../Modal/ConfirmationModal';
import { Rider } from '../../types/index';
import { Button } from '../FormElements/FormElements';
import { useRiders } from '../../context/RidersContext';
import { ToastStatus, useToast } from '../../context/toastContext';
import AuthContext from '../../context/auth';

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
  const { withDefaults } = useReq();
  const { refreshRiders } = useRiders();
  const [active, setActive] = useState(rider ? rider.active : true);
  const { toastType } = useToast();
  const [confirmationModalisOpen, setConfirmationModalisOpen] = useState(false);

  const openConfirmationModal = () => {
    setConfirmationModalisOpen(true);
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
        setActive(!active);
      });
    }
  };

  return (
    <div className={cn(styles.userDetail, { [styles.rider]: isRider })}>
      {isShowing && rider ? (
        <Toast
          message={`Rider ${rider.active ? 'deactivated' : 'activated'}.`}
          toastType={toastType ? ToastStatus.SUCCESS : ToastStatus.ERROR}
        />
      ) : null}
      <div className={styles.imgContainer}>
        {photoLink && photoLink !== '' ? (
          <img
            className={styles.profilePic}
            src={`${photoLink}`}
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
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  onClick={toggleActive}
                  checked={rider.active}
                />
                <span className={styles.slider}></span>
              </label>
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
            <button
              className={styles.deleteButton}
              onClick={openConfirmationModal}
            >
              <img className={styles.trashIcon} alt="trash" src={red_trash} />
            </button>
            <ConfirmationModal
              open={confirmationModalisOpen}
              rider={rider}
              onClose={closeConfirmationModal}
            />
          </div>
        </div>
        <div className={styles.contactInfoContainer}>{children}</div>
      </div>
    </div>
  );
};

export default UserDetail;
