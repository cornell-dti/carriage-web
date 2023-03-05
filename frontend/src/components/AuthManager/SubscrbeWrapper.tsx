import React, { useState, useEffect, ReactFragment, ReactElement } from 'react';
import subscribeUser from './subscribeUser';
import { useReq } from '../../context/req';

interface Props {
  userId: string;
  children: ReactElement;
}

const SubscribeWrapper: React.FC<Props> = ({ userId, children }) => {
  const userType = localStorage.getItem('userType');
  const [availability, setAvailability] = useState(true); // TODO
  const { withDefaults } = useReq();

  const checkNotificationAvailability = () => {
    setAvailability('serviceWorker' in navigator && 'PushManager' in window);
  };
  useEffect(checkNotificationAvailability);

  useEffect(() => {
    if (userType && availability) {
      subscribeUser(userType, userId, withDefaults);
    }
  }, [availability, userId, userType, withDefaults]);

  return <>{children}</>;
};

export default SubscribeWrapper;
