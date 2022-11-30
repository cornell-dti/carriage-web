import React, { useState } from 'react';
import StudentsTable from '../../components/UserTables/StudentsTable';
import SearchBar from '../../components/SearchBar/SearchBar';
import RiderModal from '../../components/Modal/RiderModal';
import CopyButton from '../../components/CopyButton/CopyButton';
import Notification from '../../components/Notification/Notification';
import styles from './page.module.css';
import { Button } from '../../components/FormElements/FormElements';

const Riders = () => {
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    document.title = 'Students - Carriage';
  });

  const [searchName, setSearchName] = useState<string>('');
  return (
    <main id="main">
      <div className={styles.pageTitle}>
        <h1 className={styles.header}>Students</h1>
        <div className={styles.rightSection}>
          <CopyButton />
          <Button
            className={styles.addRiderButton}
            onClick={() => setIsOpen(true)}
          >
            + Add Student
          </Button>
          <RiderModal isOpen={isOpen} setIsOpen={setIsOpen} />
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
