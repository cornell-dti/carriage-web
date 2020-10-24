import React from 'react';
import styles from './userDetail.module.css';
import { edit, phone } from "./icons";

type otherInfo = {
  children: JSX.Element | JSX.Element[];
}

export const OtherInfo = ({ children }: otherInfo) => (
  <div className={styles.otherInfoContainer}>
    {children}
  </div>
)

type UserDetailProps = {
  profilePic: string;
  firstName: string;
  lastName: string;
  netID: string;
  children: JSX.Element | JSX.Element[];
}

const UserDetail = (user: UserDetailProps) => {
  const fullName = user.firstName + " " + user.lastName;
  return (
    <div className={styles.userDetail}>
      <div className={styles.imgContainer}>
        <img className={styles.profilePic} src={user.profilePic} />
      </div>
      <div className={styles.basicInfoContainer}>
        <p className={styles.name}>{fullName}</p>
        <p className={styles.netId}>{user.netID}</p>
        <img className={styles.edit} src={edit} />
        {user.children}
      </div>
    </div>
  )
}

export default UserDetail;