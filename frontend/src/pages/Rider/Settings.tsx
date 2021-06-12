import React, { useState, useContext, useEffect } from 'react';
import UserDetail, { UserContactInfo } from '../../components/UserDetail/UserDetail';
import { phone, mail } from '../../icons/userInfo/index';
import AuthContext from '../../context/auth';
import { useReq } from '../../context/req';
import pageStyles from '../Admin/page.module.css';
import styles from './settings.module.css';
import Notification from '../../components/Notification/Notification';
import { Rider } from '../../types/index';

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
  const { user } = useContext(AuthContext);
  console.log(user);
  const netId = user?.email.split('@')[0] || '';

  return (
    <main id = "main">
      <div className={pageStyles.pageTitle}>
        <h1 className={pageStyles.header}>Settings</h1>
        <div className={pageStyles.rightSection}>
          <Notification />
        </div>
      </div>
      <UserDetail
        firstName={user?.firstName || ''}
        lastName={user?.lastName || ''}
        netId={netId}
        photoLink={user?.photoLink}
        isRider={true}
        rider={user as Rider}
      >
        <UserContactInfo icon={phone} alt="Phone" text={user?.phoneNumber || ''} />
        <UserContactInfo icon={mail} alt="Email" text={user?.email || ''} />
      </UserDetail>
      {/* <NotifPreferences /> */}
    </main>
  );
};
export default Settings;
