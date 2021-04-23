import React from 'react';
import styles from './userDetail.module.css';
import { edit, trash } from '../../icons/other/index';
import EmployeeModal from '../EmployeeModal/EmployeeModal';

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
};

type UserDetailProps = {
  firstName: string;
  lastName: string;
  netId: string;
  children: JSX.Element | JSX.Element[];
  employee?: EmployeeDetailProps;
  role?: string;
  photoLink?: string;
};

const UserDetail = ({
  firstName,
  lastName,
  netId,
  children,
  employee,
  role,
  photoLink,
  children
}: UserDetailProps) => {
  const fullName = `${firstName} ${lastName}`;
  return (
    <div className={styles.userDetail}>
      {photoLink && photoLink !== ''
          ? <img className={styles.profilePic} src={`http://${photoLink}`} />
          : null}
      <div className={styles.basicInfoContainer}>
        <div className={styles.basicInfoTop}>
          <div className={styles.nameInfoContainer}>
            <p className={styles.name}>{fullName}</p>
            <p className={styles.netId}>{netId}</p>
          </div>
          <div className={styles.userEditContainer}>
            <img className={styles.editIcon} alt="edit" src={edit} />
            <img className={styles.editIcon} alt="trash" src={trash} />
          </div>
        </div>
        <div className={styles.contactInfoContainer}>{children}</div>
      </div>
    </div>
  );
};

export default UserDetail;
