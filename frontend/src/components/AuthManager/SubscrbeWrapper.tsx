import React, { useState, useEffect, ReactFragment, ReactElement } from 'react';
import subscribeUser from './subscribeUser';

interface Props {
  userId: string;
  children: ReactElement;
}

const SubscribeWrapper: React.FC<Props> = ({ userId, children }) => {
  const [userType, setUserType] = useState<string | null>(null);
  const [availability, setAvailability] = useState(true); // TODO

  const checkNotificationAvailability = () => {
    setAvailability('serviceWorker' in navigator && 'PushManager' in window);
  };

  useEffect(checkNotificationAvailability, []);
  useEffect(() => {
    setUserType(localStorage.getItem('userType'));
  }, []);

  useEffect(() => {
    if (userType && availability) {
      subscribeUser(userType!, userId);
    }
  }, [availability, userId, userType]);

  return <>{children}</>;
};

export default SubscribeWrapper;
