import React, { useEffect, useState } from 'react';
import EmployeeModal from '../../components/EmployeeModal/EmployeeModal';
import EmployeeCards from '../../components/EmployeeCards/EmployeeCards';
import styles from './page.module.css';
import Notification from '../../components/Notification/Notification';
import { Button } from '../../components/FormElements/FormElements';
import SearchBar from '../../components/SearchBar/SearchBar';

const Employees = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    document.title = 'Employees - Carriage';
  }, []);

  return (
    <main id="main">
      <div className={styles.pageTitle}>
        <h1 className={styles.header}>Employees</h1>
        <div className={styles.rightSection}>
          <Button onClick={() => setIsOpen(true)}>+ Add an employee</Button>
          <EmployeeModal isOpen={isOpen} setIsOpen={setIsOpen} />
          <Notification />
        </div>
      </div>
      <SearchBar
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for employees..."
      />
      <EmployeeCards query={query} />
    </main>
  );
};

export default Employees;
