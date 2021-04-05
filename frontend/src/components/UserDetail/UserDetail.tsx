import React from 'react';
import styles from './userDetail.module.css';
import { edit, trash } from '../../icons/other/index';

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

type UserDetailProps = {
  // profilePic: string;
  firstName: string;
  lastName: string;
  netId: string;
  photoLink: string | undefined;
  children: JSX.Element | JSX.Element[];
};

const UserDetail = ({
  firstName,
  lastName,
  netId,
  photoLink,
  children
}: UserDetailProps) => {
  const fullName = `${firstName} ${lastName}`;
  return (
    <div className={styles.userDetail}>
      {photoLink !== undefined ? (
        <img className={styles.profilePic} src={photoLink} />
      ) : (
        <div className={styles.undefinedProfilePic} />
      )}
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
