import React, { useState } from 'react';
import RidersTable from '../../components/UserTables/RidersTable';
import RiderModal from '../../components/Modal/RiderModal';
import styles from './page.module.css';

const Riders = () => {
  const [riders, setRiders] = useState(
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
      <RidersTable />
    </>
  );
};

export default Riders;
