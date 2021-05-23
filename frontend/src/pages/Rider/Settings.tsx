import React, { useState, useContext, useEffect } from 'react';
import UserDetail, { UserContactInfo } from '../../components/UserDetail/UserDetail';
import { phone, mail } from '../../icons/userInfo/index';
import AuthContext from '../../context/auth';
import { useReq } from '../../context/req';
import pageStyles from '../Admin/page.module.css';
import styles from './settings.module.css';
import Notification from '../../components/Notification/Notification';

type RiderProfile = {
  email: string;
  firstName: string;
  joinDate: string;
  lastName: string;
  phoneNumber: string;
  pronouns: string;
  photoLink?: string;
}

const NotifPreferences = () => (
  <div className={styles.settings}>
    <div>
      <h3>Notifications</h3>
      <div>
        <label className={styles.checkbox}><input type="checkbox" value="confirm" /> Ride request confirmed</label>
        <label className={styles.checkbox}><input type="checkbox" value="cancel" /> Ride info cancelled/edited</label>
      </div>
      <hr className={styles.divider} />
    </div>
    <div>
      <h3>Email Preferences</h3>
      <div>
        <label className={styles.checkbox}><input type="checkbox" value="confirm" /> Ride confirmation</label>
        <label className={styles.checkbox}><input type="checkbox" value="edit" /> Ride information edited</label>
        <label className={styles.checkbox}><input type="checkbox" value="cancel" /> Ride Ride cancelled</label>
      </div>
      <hr className={styles.divider} />
    </div>
  </div>
);

const Settings = () => {
  const { id } = useContext(AuthContext);
  const { withDefaults } = useReq();
  const [rider, setRider] = useState<RiderProfile>();
  const netId = rider?.email.split('@')[0] || '';

  useEffect(() => {
    fetch(`/api/riders/${id}/profile`, withDefaults())
      .then((res) => res.json())
      .then((data) => setRider(data));
  }, [withDefaults, id]);

  return (
    <>
      <div className={pageStyles.pageTitle}>
        <h1 className={pageStyles.header}>Settings</h1>
        <div className={pageStyles.rightSection}>
          <Notification />
        </div>
      </div>
      <UserDetail
        firstName={rider?.firstName || ''}
        lastName={rider?.lastName || ''}
        netId={netId}
        photoLink={rider?.photoLink}
        isRider={true}
      >
        <UserContactInfo icon={phone} alt="Phone" text={rider?.phoneNumber || ''} />
        <UserContactInfo icon={mail} alt="Email" text={rider?.email || ''} />
      </UserDetail>
      {/* <NotifPreferences /> */}
    </>
  );
};
export default Settings;
