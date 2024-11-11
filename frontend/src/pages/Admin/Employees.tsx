import React, { useState, useEffect, useMemo } from 'react';
import EmployeeModal from '../../components/EmployeeModal/EmployeeModal';
import EmployeeCards from '../../components/EmployeeCards/EmployeeCards';
import Notification from '../../components/Notification/Notification';
import SearchAndFilter from 'components/FormElements/SearchAndFilter';
import styles from './page.module.css';
import { Button } from '../../components/FormElements/FormElements';
import StatsBox from 'components/AnalyticsOverview/StatsBox';
import { useEmployees } from '../../context/EmployeesContext';
import { active, inactive } from '../../icons/other/index';
import { AdminType, DriverType } from '../../types';

const Employees = () => {
  const { admins, drivers } = useEmployees();
  const [isOpen, setIsOpen] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState<(AdminType | DriverType)[]>([]);

  // Combine admins and drivers, using `roleType` as a list
  const displayEmployees = useMemo(() => {
    const employeeMap = new Map();

    admins.forEach(admin => {
      const roleType = admin.isDriver ? ['admin', 'driver'] : ['admin'];
      employeeMap.set(admin.id, { ...admin, roleType });
    });

    drivers.forEach(driver => {
      if (!employeeMap.has(driver.id)) {
        employeeMap.set(driver.id, { ...driver, roleType: ['driver'] });
      }
    });

    return Array.from(employeeMap.values());
  }, [admins, drivers]);

  useEffect(() => {
    document.title = 'Employees - Carriage';
    setFilteredEmployees(displayEmployees);
  }, [displayEmployees]);

  const handleFilterApply = (filteredItems: (AdminType | DriverType)[]) => {
    setFilteredEmployees(filteredItems);
  };

  // Employee statistics
  const adminCount = admins.length;
  const driverCount = drivers.length;
  const employeeStats = [
    {
      icon: active,
      alt: 'admin',
      stats: adminCount,
      description: 'Administrators',
      variant: 'green' as const
    },
    {
      icon: inactive,
      alt: 'driver',
      stats: driverCount,
      description: 'Drivers',
      variant: 'red' as const
    }
  ];

  return (
    <main id="main">
      <div className={styles.pageTitle}>
        <h1 className={styles.header}>Employees</h1>
        <div className={styles.rightSection}>
          <Button onClick={() => setIsOpen(true)}>+ Add Employee</Button>
          <EmployeeModal isOpen={isOpen} setIsOpen={setIsOpen} />
          <Notification />
        </div>
      </div>

      <div className={styles.statsAndSearch}>
        <div className={styles.searchFilter}>
          <SearchAndFilter
            items={displayEmployees} 
            searchFields={['firstName', 'lastName']}
            filterOptions={[
              {
                field: 'roleType',
                label: 'Role',
                options: [
                  { value: 'admin', label: 'Admin' },
                  { value: 'driver', label: 'Driver' },
                ],
              }
            ]}
            onFilterApply={handleFilterApply}
          />
        </div>
        <div className={styles.statsBoxContainer}>
          {employeeStats.map((stat, idx) => (
            <StatsBox key={idx} {...stat} />
          ))}
        </div>
      </div>

      <div className={styles.employeeCards}>
        <EmployeeCards employees={filteredEmployees} />
      </div>
    </main>
  );
};

export default Employees;

