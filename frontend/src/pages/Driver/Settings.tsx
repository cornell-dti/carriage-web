import React, { useContext, useEffect } from 'react';
import UserDetail, {
  UserContactInfo,
} from '../../components/UserDetail/UserDetail';
import { phone, mail } from '../../icons/userInfo/index';
import AuthContext from '../../context/auth';
import pageStyles from '../Admin/page.module.css';
import styles from './settings.module.css';
import Notification from '../../components/Notification/Notification';
import { DriverType as Driver } from 'types';

const NotifPreferences = () => (
  <div className={styles.settings}>
    <div>
      <h3>Notifications</h3>
      <div>
        <label className={styles.checkbox}>
          <input type="checkbox" value="assign" defaultChecked /> New ride
          assignment
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" value="update" defaultChecked /> Ride
          information updated
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" value="cancel" defaultChecked /> Ride cancelled
        </label>
      </div>
      <hr className={styles.divider} />
    </div>
    <div>
      <h3>Email Preferences</h3>
      <div>
        <label className={styles.checkbox}>
          <input type="checkbox" value="daily" /> Daily schedule summary
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" value="assign" defaultChecked /> New ride
          assignments
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" value="cancel" defaultChecked /> Ride
          cancellations
        </label>
      </div>
      <hr className={styles.divider} />
    </div>
    <div>
      <h3>Availability</h3>
      <div>
        <label className={styles.checkbox}>
          <input type="checkbox" value="monday" defaultChecked /> Monday
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" value="tuesday" defaultChecked /> Tuesday
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" value="wednesday" defaultChecked /> Wednesday
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" value="thursday" defaultChecked /> Thursday
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" value="friday" defaultChecked /> Friday
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" value="saturday" /> Saturday
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" value="sunday" /> Sunday
        </label>
      </div>
    </div>
  </div>
);

const Settings = () => {
  const { user } = useContext(AuthContext);
  const netId = user?.email?.split('@')[0] || '';

  useEffect(() => {
    document.title = 'Settings - Carriage';
  }, []);

  return (
    <main id="main">
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
        driver={user as Driver}
        role="driver"
      >
        <UserContactInfo
          icon={phone}
          alt="Phone"
          text={user?.phoneNumber || ''}
        />
        <UserContactInfo icon={mail} alt="Email" text={user?.email || ''} />
      </UserDetail>
      <NotifPreferences />
    </main>
  );
};

export default Settings;
