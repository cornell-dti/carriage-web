import React, { useState, useContext, useEffect } from 'react';
import UserDetail, { UserContactInfo } from '../../components/UserDetail/UserDetail';
import { phone, mail } from '../../icons/userInfo/index';
import AuthContext from '../../context/auth';
import { useReq } from '../../context/req';
import styles from "../Admin/page.module.css"
import Notification from '../../components/Notification/Notification';

type RiderProfile = {
  email: string;
  firstName: string;
  joinDate: string;
  lastName: string;
  phoneNumber: string;
  pronouns: string;
}

const Settings = () => {
  const { id } = useContext(AuthContext);
  const { withDefaults } = useReq();
  const [rider, setRider] = useState<RiderProfile>();
  const netId = rider?.email.split('@')[0] || ""

  useEffect(() => {
      fetch(`/api/riders/${id}/profile`, withDefaults())
        .then((res) => res.json())
        .then((data) => {setRider(data)})
  }, [withDefaults, id]);

  return (
      <>
      <div className={styles.pageTitle}>
        <h1 className={styles.header}>Settings</h1>
        <div className={styles.rightSection}>
          <Notification />
        </div>
      </div>
      <UserDetail
          firstName={rider?.firstName || ""}
          lastName={rider?.lastName || ""}
          netId={netId}
          isRider={true}
      >
          <UserContactInfo icon={phone} alt="" text={rider?.phoneNumber || ""} />
          <UserContactInfo icon={mail} alt="" text={rider?.email || ""} />
      </UserDetail>
      </>
    );
};
export default Settings;