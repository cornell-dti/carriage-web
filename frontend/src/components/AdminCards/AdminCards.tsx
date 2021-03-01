import React, { useEffect, useState } from 'react';
import Card, { CardInfo } from '../Card/Card';
import styles from './admincards.module.css';
import { capacity, clock, phone, wheel } from '../../icons/userInfo/index';
import { Admin } from '../../types';
import { useReq } from '../../context/req';

const formatPhone = (phoneNumber: string) => {
  const areaCode = phoneNumber.substring(0, 3);
  const firstPart = phoneNumber.substring(3, 6);
  const secondPart = phoneNumber.substring(6, 10);
  return `${areaCode}-${firstPart}-${secondPart}`;
};

type AdminCardProps = {
  id: string,
  admin: Admin;
}

const AdminCard = ({
  id,
  admin: {
    firstName,
    lastName,
    email,
    phoneNumber,
  },
}: AdminCardProps) => {
  const netId = email.split('@')[0];
  const fmtPhone = formatPhone(phoneNumber);
  const fullName = `${firstName}_${lastName}`;
  const userInfo = {
    id,
    firstName,
    lastName,
    netId,
    phone: fmtPhone,
  };

  return (
      <Card firstName={firstName} lastName={lastName} netId={netId} >
        <CardInfo icon={phone} alt="phone icon">
          <p>{fmtPhone}</p>
        </CardInfo>
        <CardInfo icon={clock} alt="clock icon">
          <p>--</p>
        </CardInfo>
        <CardInfo icon={wheel} alt="wheel icon">
          <p>--</p>
          <img src={capacity} alt="capacity icon" style={{ marginLeft: '2px' }} />
        </CardInfo>
      </Card>
  );
};

const AdminCards = () => {
  const [admins, setAdmins] = useState<Admin[]>();
  const { withDefaults } = useReq();

  useEffect(() => {
    fetch('/api/dispatchers', withDefaults())
      .then((res) => res.json())
      .then(({ data }) => setAdmins(data));
  }, [withDefaults]);

  return (
    <div className={styles.cardsContainer}>
      {admins && admins.map((admin) => (
        <AdminCard
          key={admin.id}
          id={admin.id}
          admin={admin}
        />
      ))}
    </div>
  );
};

export default AdminCards;
