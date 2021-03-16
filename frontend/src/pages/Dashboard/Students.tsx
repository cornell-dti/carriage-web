import React, { useState } from 'react';
import { NewRider } from '../../types';
import RidersTable from '../../components/UserTables/RidersTable';
import RiderModal from '../../components/Modal/RiderModal';
import styles from './page.module.css';

const Riders = () => {
  const [riders, setRiders] = useState<NewRider[]>(
    [
      {
        id: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        accessibility: new Array<string>(),
        description: '',
        joinDate: '',
        endDate: '',
        pronouns: '',
        address: '',
        favoriteLocations: new Array<string>(),
        organization: '',
      },
    ],
  );
  return (
    <>
      <div className={styles.pageTitle}>
        <h1 className={styles.header}>Students</h1>
        <RiderModal riders={riders} setRiders={setRiders} />
      </div>
      <RidersTable riders={riders} setRiders={setRiders} />
    </>
  );
};

export default Riders;
