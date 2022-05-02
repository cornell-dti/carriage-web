import React, { useState } from 'react';
import StudentsTable from '../../components/UserTables/StudentsTable';
import SearchBar from '../../components/SearchBar/SearchBar';
import RiderModal from '../../components/Modal/RiderModal';
import CopyButton from '../../components/CopyButton/CopyButton';
import Notification from '../../components/Notification/Notification';
import styles from './page.module.css';

const Riders = () => {
  const [searchName, setSearchName] = useState<string>('');
  return (
    <main id="main">
      <div className={styles.pageTitle}>
        <h1 className={styles.header}>Students</h1>
        <div className={styles.rightSection}>
          <CopyButton />
          <RiderModal />
          <Notification />
        </div>
      </div>
      <SearchBar enteredName={searchName} setEnteredName={setSearchName} />
      <div className={styles.studentTable}>
        <StudentsTable searchName={searchName} />
      </div>
    </main>
  );
};

export default Riders;
