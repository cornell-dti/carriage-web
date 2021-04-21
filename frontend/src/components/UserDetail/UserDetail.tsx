import React from 'react';
import styles from './userDetail.module.css';
import { edit } from '../../icons/other/index';
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
}: UserDetailProps) => {
  const fullName = `${firstName} ${lastName}`;
  return (
    <div className={styles.userDetail}>
      <div className={styles.imgContainer}>
        {photoLink && photoLink !== ''
          ? <img className={styles.profilePic} src={`http://${photoLink}`} />
          : null}
      </div>
      
      <div className={styles.basicInfoContainer}>
        <p className={styles.name}>{fullName}</p>
        <p className={styles.netId}>{netId}</p>
      {
        employee ?
          <EmployeeModal 
            existingEmployee={{
                id: employee.id,
                name: employee.firstName + ' ' + employee.lastName,
                netId: employee.netId,
                email: employee.netId + '@cornell.edu',
                phone: employee.phone.replaceAll('-', ''), //remove dashes'-'
                availability: employee.availability, 
                role: role,
                photoLink: employee.photoLink
            }}
          /> : <img className={styles.edit} alt="edit" src={edit} />
      }
        <div className={styles.contactInfoContainer}>{children}</div>
      </div>
    </div>
  );
};

export default UserDetail;
