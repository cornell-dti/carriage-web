import { useContext, useEffect } from 'react';
import UserDetail, {
  UserContactInfo,
} from '../../components/UserDetail/legacy/UserDetail';
import { phone, mail } from '../../icons/userInfo/index';
import AuthContext from '../../context/auth';
import { DriverType } from '@carriage-web/shared/types/driver';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const netId = user?.email?.split('@')[0] || '';

  useEffect(() => {
    document.title = 'Settings - Carriage';
  }, []);

  return (
    <main id="main">
      <div className="flex justify-between items-center p-8 text-[1.75rem] text-left m-0">
        <h1 className="w-full text-left text-[1.75rem] m-0">Settings</h1>
        <div className="w-full flex items-center justify-end gap-2 [&>div]:ml-3.5"></div>
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
