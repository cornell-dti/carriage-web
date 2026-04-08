import React, { useState, useEffect, useMemo } from 'react';
import EmployeeModal from '../../components/EmployeeModal/EmployeeModal';
import EmployeeCards from '../../components/EmployeeCards/EmployeeCards';
import SearchAndFilter from 'components/FormElements/SearchAndFilter';
import StatsBox from 'components/AnalyticsOverview/StatsBox';
import Pagination from '@mui/material/Pagination';
import { useEmployees } from '../../context/EmployeesContext';
import { wheel, user } from '../../icons/userInfo/index';
import { AdminType } from '@carriage-web/shared/types/admin';
import { DriverType } from '@carriage-web/shared/types/driver';

const Employees = () => {
  const { admins, drivers } = useEmployees();
  const [isOpen, setIsOpen] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState<
    (AdminType | DriverType)[]
  >([]);
  const [selectedEmployee, setSelectedEmployee] = useState<
    AdminType | DriverType | null
  >(null);

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const displayEmployees = useMemo(() => {
    const employeeMap = new Map();

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

  function convertToEmployeeEntity(employee: AdminType | DriverType): any {
    // Check if it's an admin
    const isAdmin = 'type' in employee && 'isDriver' in employee;
    // Check if it's a driver
    const isDriver = 'availability' in employee;

    const data = {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      netId: employee.email.split('@')[0], // Extract netId from email
      phoneNumber: employee.phoneNumber,
      photoLink: employee.photoLink,
      admin: isAdmin
        ? {
            type: (employee as AdminType).type,
            isDriver: (employee as AdminType).isDriver,
          }
        : undefined,
      driver: isDriver
        ? {
            availability: (employee as DriverType).availability,
            startDate: (employee as DriverType).joinDate, // Map joinDate to startDate for the modal
          }
        : undefined,
    };
    return data;
  }

  const handleFilterApply = (filteredItems: (AdminType | DriverType)[]) => {
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
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  return (
    <main id="main">
      <div className="flex flex-col gap-8 p-8">
        <div className="flex justify-between items-center p-8 text-[1.75rem] text-left m-0">
          <h1 className="w-full text-left text-[1.75rem] m-0">Employees</h1>
          <div className="w-full flex items-center justify-end gap-2 [&>div]:ml-3.5">
            <button
              className="w-40 h-10 flex items-center justify-center cursor-pointer rounded text-base text-nowrap px-6 border border-[#303030] bg-black text-white transition-all duration-100 hover:bg-[#333] hover:text-white active:bg-[#555] active:text-white"
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

        <div className="px-8 flex flex-row items-center gap-4 w-full h-12">
          <div className="grow h-[80%] flex [&>div]:w-full [&>div]:h-[80%]">
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
          <div className="flex gap-4 shrink-0 h-full">
            {employeeStats.map((stat, idx) => (
              <StatsBox key={idx} {...stat} />
            ))}
          </div>
        </div>

        <EmployeeCards employees={paginatedEmployees} />

        <div className="flex justify-center my-8 p-4">
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
