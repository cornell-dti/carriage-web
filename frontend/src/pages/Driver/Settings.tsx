import React, { useContext, useEffect } from 'react';
import UserDetail, {
  UserContactInfo,
} from '../../components/UserDetail/legacy/UserDetail';
import { phone, mail } from '../../icons/userInfo/index';
import AuthContext from '../../context/auth';
import pageStyles from '../Admin/page.module.css';
import styles from './settings.module.css';
import Notification from '../../components/Notification/Notification';
import { DriverType as Driver } from 'types';

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
        employee={{
          id: (user as Driver)?.id || '',
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          netId,
          phoneNumber: user?.phoneNumber || '',
          availability: (user as Driver)?.availability as unknown as
            | string[]
            | undefined,
          photoLink: user?.photoLink,
          startDate: (user as Driver)?.joinDate,
          isDriver: true,
        }}
        role="driver"
      >
        <UserContactInfo
          icon={phone}
          alt="Phone"
          text={user?.phoneNumber || ''}
        />
        <UserContactInfo icon={mail} alt="Email" text={user?.email || ''} />
      </UserDetail>
    </main>
  );
};

export default Settings;
