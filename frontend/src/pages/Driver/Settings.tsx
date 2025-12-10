import React, { useContext, useEffect } from 'react';
import UserDetail, {
  UserContactInfo,
} from '../../components/UserDetail/legacy/UserDetail';
import { phone, mail } from '../../icons/userInfo/index';
import AuthContext from '../../context/auth';
import pageStyles from '../Admin/page.module.css';
import styles from './settings.module.css';
import Notification from '../../components/Notification/Notification';
import { DriverType } from '@carriage-web/shared/types/driver';

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
        driver={user as DriverType}
        employee={{
          id: (user as DriverType)?.id || '',
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          netId,
          phoneNumber: user?.phoneNumber || '',
          availability: (user as DriverType)?.availability as unknown as
            | string[]
            | undefined,
          photoLink: user?.photoLink,
          startDate: (user as DriverType)?.joinDate,
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
