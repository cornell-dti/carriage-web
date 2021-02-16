import React, { useState } from 'react';
import RidersTable from '../../components/UserTables/RidersTable';
import RiderModal from '../../components/Modal/RiderModal';

const emptyStringArray: string[] = [];

const Riders = () => {
  const [riders, setRiders] = useState([
    {
      id: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      accessibilityNeeds: emptyStringArray,
      description: '',
      joinDate: '',
      pronouns: '',
      address: '',
    },
  ]);
  return (
    <>
      <RiderModal riders={riders} setRiders={setRiders} />
      <RidersTable riders={riders} setRiders={setRiders} />
    </>
  );
};

export default Riders;
