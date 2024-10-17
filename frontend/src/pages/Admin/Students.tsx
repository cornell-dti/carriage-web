import React, { useState, useEffect } from 'react';
import StudentsTable from '../../components/UserTables/StudentsTable';
import RiderModal from '../../components/Modal/RiderModal';
import CopyButton from '../../components/CopyButton/CopyButton';
import Notification from '../../components/Notification/Notification';
import SearchAndFilter from 'components/FormElements/SearchAndFilter';
import styles from './page.module.css';
import { Button } from '../../components/FormElements/FormElements';
import { useRiders } from '../../context/RidersContext';
import { Rider, Accessibility } from '../../types';

const Riders = () => {
  const { riders } = useRiders();
  const [isOpen, setIsOpen] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<Rider[]>(riders);

  useEffect(() => {
    document.title = 'Students - Carriage';
    setFilteredStudents(riders); 
  }, [riders]); 

  const handleFilterApply = (filteredItems: Rider[]) => {
    setFilteredStudents(filteredItems);
  };

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

      <SearchAndFilter
        items={riders} 
        searchFields={['firstName', 'lastName']} 
        filterOptions={[
          {
            field: 'active', 
            label: 'Status',
            options: [
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ],
          },
          {
            field: 'accessibility',
            label: 'Disability',
            options: Object.values(Accessibility).map(value => ({ value, label: value })),
          },
        ]}
        onFilterApply={handleFilterApply} 
      />

      <div className={styles.studentTable}>
        <StudentsTable students={filteredStudents} />
      </div>
    </main>
  );
};

export default Riders;
