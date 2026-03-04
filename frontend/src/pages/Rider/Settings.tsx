import { useContext, useEffect } from 'react';
import UserDetail, {
  UserContactInfo,
} from '../../components/UserDetail/legacy/UserDetail';
import { phone, mail } from '../../icons/userInfo/index';
import AuthContext from '../../context/auth';
import pageStyles from '../Admin/page.module.css';
import { Rider } from '../../types/index';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const netId = user?.email.split('@')[0] || '';

  useEffect(() => {
    document.title = 'Settings - Carriage';
  }, []);

  return (
    <main id="main">
      <div className={pageStyles.pageTitle}>
        <h1 className={pageStyles.header}>Settings</h1>
        <div className={pageStyles.rightSection}></div>
      </div>
      <UserDetail
        firstName={user?.firstName || ''}
        lastName={user?.lastName || ''}
        netId={netId}
        photoLink={user?.photoLink}
        isRider={true}
        rider={user as Rider}
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
