import React, { useState, useEffect } from 'react';
import StudentsTable from '../../components/UserTables/StudentsTable';
import RiderModal from '../../components/Modal/RiderModal';
import CopyButton from '../../components/CopyButton/CopyButton';
import SearchAndFilter from 'components/FormElements/SearchAndFilter';
import styles from './page.module.css';
import { Button } from '../../components/FormElements/FormElements';
import { useRiders } from '../../context/RidersContext';
import { Rider, Accessibility } from '../../types';
import StatsBox from 'components/AnalyticsOverview/StatsBox';
import { active, inactive } from '../../icons/other/index';

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

  // Calculate statistics
  const activeStudents = riders.filter((rider) => rider.active).length;
  const inactiveStudents = riders.filter((rider) => !rider.active).length;

  const studentStats = [
    {
      icon: active,
      alt: 'active',
      stats: activeStudents,
      description: 'Active Students',
      variant: 'green' as const,
    },
    {
      icon: inactive,
      alt: 'inactive',
      stats: inactiveStudents,
      description: 'Inactive Students',
      variant: 'red' as const,
    },
  ];

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
        </div>
      </div>

      <div className={styles.statsAndSearch}>
        <div className={styles.searchFilter}>
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
                options: Object.values(Accessibility).map((value) => ({
                  value,
                  label: value,
                })),
              },
            ]}
            onFilterApply={handleFilterApply}
          />
        </div>
        <div className={styles.statsBoxContainer}>
          {studentStats.map((stat, idx) => (
            <StatsBox key={idx} {...stat} />
          ))}
        </div>
      </div>

      <div className={styles.studentTable}>
        <StudentsTable students={filteredStudents} />
      </div>
    </main>
  );
};

export default Riders;
