import { useContext, useEffect, useState } from 'react';
import UserDetail, {
  UserContactInfo,
} from '../../components/UserDetail/legacy/UserDetail';
import { phone, mail } from '../../icons/userInfo/index';
import AuthContext from '../../context/auth';
import pageStyles from '../Admin/page.module.css';
import { RiderType } from '@carriage-web/shared/types/rider';
import RiderModal from '../../components/Modal/RiderModal';
import { Button } from '../../components/FormElements/FormElements';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const netId = user?.email.split('@')[0] || '';
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    document.title = 'Settings - Carriage';
  }, []);

  return (
    <main id="main">
      <div className={pageStyles.pageTitle}>
        <h1 className={pageStyles.header}>Settings</h1>
        <div className={pageStyles.rightSection}>
          <Button onClick={() => setIsEditOpen(true)}>Edit Profile</Button>
        </div>
      </div>
      <UserDetail
        firstName={user?.firstName || ''}
        lastName={user?.lastName || ''}
        netId={netId}
        photoLink={user?.photoLink}
        isRider={true}
        rider={user as RiderType}
      >
        <UserContactInfo
          icon={phone}
          alt="Phone"
          text={user?.phoneNumber || ''}
        />
        <UserContactInfo icon={mail} alt="Email" text={user?.email || ''} />
      </UserDetail>
      <RiderModal
        existingRider={user as RiderType}
        isRiderWeb={true}
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
      />
    </main>
  );
};
export default Settings;
