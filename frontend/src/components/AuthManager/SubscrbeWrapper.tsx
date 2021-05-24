import React, { useState, useEffect } from 'react';
import subscribeUser from './subscribeUser';
import { useReq } from '../../context/req';

interface Props {
  userId: string
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
    userType && availability && subscribeUser(userType, userId, withDefaults);
  }, [availability, userId, userType, withDefaults]);

  return <>{children}</>;
};

export default SubscribeWrapper;
