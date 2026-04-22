import React, { useState, useEffect, useMemo } from 'react';
import EmployeeModal from '../../components/EmployeeModal/EmployeeModal';
import EmployeeCards from '../../components/EmployeeCards/EmployeeCards';
import SearchAndFilter from 'components/FormElements/SearchAndFilter';
import styles from './page.module.css';
import StatsBox from 'components/AnalyticsOverview/StatsBox';
import Pagination from '@mui/material/Pagination';
import { useEmployees } from '../../context/EmployeesContext';
import { wheel, user } from '../../icons/userInfo/index';
import { EmployeeType } from '@carriage-web/shared/types/employee';
import buttonStyles from '../../styles/button.module.css';

const Employees = () => {
  const { admins, drivers } = useEmployees();
  const [isOpen, setIsOpen] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeType[]>([]);
  const [selectedEmployee] = useState<EmployeeType | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Deduplicate by id — a person who is both admin and driver appears in both lists
  const displayEmployees = useMemo(() => {
    const employeeMap = new Map<string, EmployeeType & { roleType: string[] }>();

    admins.forEach((admin) => {
      const roleType = admin.isDriver ? ['admin', 'driver'] : ['admin'];
      employeeMap.set(admin.id, { ...admin, roleType });
    });

    drivers.forEach((driver) => {
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

  function convertToEmployeeEntity(employee: EmployeeType): any {
    return {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      netId: employee.email.split('@')[0],
      phoneNumber: employee.phoneNumber,
      photoLink: employee.photoLink,
      admin: employee.isAdmin
        ? {
            type: employee.adminRoles,
            isDriver: employee.isDriver,
          }
        : undefined,
      driver: employee.isDriver
        ? {
            availability: employee.availability,
            startDate: employee.joinDate,
          }
        : undefined,
    };
  }

  const handleFilterApply = (filteredItems: EmployeeType[]) => {
    setFilteredEmployees(filteredItems);
    setPage(1);
  };

  const paginatedEmployees = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredEmployees.slice(startIndex, startIndex + pageSize);
  }, [filteredEmployees, page, pageSize]);

  const adminCount = admins.length;
  const driverCount = drivers.length;
  const employeeStats = [
    {
      icon: user,
      alt: 'admin',
      stats: adminCount,
      description: 'Administrators',
      variant: 'green' as const,
    },
    {
      icon: wheel,
      alt: 'driver',
      stats: driverCount,
      description: 'Drivers',
      variant: 'red' as const,
    },
  ];

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  return (
    <main id="main">
      <div className={styles.mainContent}>
        <div className={styles.pageTitle}>
          <h1 className={styles.header}>Employees</h1>
          <div className={styles.rightSection}>
            <button
              style={{ width: '10rem' }}
              className={`${buttonStyles.button} ${buttonStyles.buttonPrimary} ${buttonStyles.buttonLarge}`}
              onClick={() => setIsOpen(true)}
            >
              + Add Employee
            </button>
            <EmployeeModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              existingEmployee={
                selectedEmployee
                  ? convertToEmployeeEntity(selectedEmployee)
                  : null
              }
            />
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
                },
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

        <EmployeeCards employees={paginatedEmployees} />

        <div className={styles.paginationContainer}>
          <Pagination
            count={Math.ceil(filteredEmployees.length / pageSize)}
            page={page}
            onChange={handlePageChange}
            size="large"
            showFirstButton
            showLastButton
          />
        </div>
      </div>
    </main>
  );
};

export default Employees;
