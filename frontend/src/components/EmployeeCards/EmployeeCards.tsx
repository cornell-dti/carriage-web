import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardInfo } from '../Card/Card';
import styles from './employeecards.module.css';
import { clock, phone, wheel, user } from '../../icons/userInfo/index';
import { Employee } from '../../types';
import { useEmployees } from '../../context/EmployeesContext';
import { AdminType } from '../../../../server/src/models/admin';
import { DriverType } from '../../../../server/src/models/driver';
import { Button } from '../FormElements/FormElements';

const formatPhone = (phoneNumber: string) => {
  const areaCode = phoneNumber.substring(0, 3);
  const firstPart = phoneNumber.substring(3, 6);
  const secondPart = phoneNumber.substring(6, 10);
  return `${areaCode}-${firstPart}-${secondPart}`;
};

type EmployeeCardProps = {
  id: string;
  employee: Employee;
};

//Convert DriverType to EmployeeType
// const DriverToEmployees = (drivers: DriverType[]): EmployeeDetailProps[] => {
//   return drivers.map((driver) => ({
//     id: driver.id,
//     firstName: driver.firstName,
//     lastName: driver.lastName,
//     availability: formatAvailability(driver.availability)!,
//     netId: driver.email.split('@')[0],
//     phone: driver.phoneNumber,
//     photoLink: driver.photoLink,
//     startDate: driver.startDate,
//   }));
// };

// //Convert AdminType to EmployeeType
// const AdminToEmployees = (admins: AdminType[]): EmployeeDetailProps[] => {
//   return admins.map((admin) => ({
//     id: admin.id,
//     firstName: admin.firstName,
//     lastName: admin.lastName,
//     type: admin.type,
//     isDriver: admin.isDriver,
//     netId: admin.email.split('@')[0],
//     phone: admin.phoneNumber,
//     photoLink: admin.photoLink,
//   }));
// };

const EmployeeCard = ({
  id,
  employee: {
    firstName,
    lastName,
    email,
    type,
    isDriver,
    phoneNumber,
    availability,
    photoLink,
    startDate,
  },
}: EmployeeCardProps) => {
  const netId = email.split('@')[0];
  const fmtPhone = formatPhone(phoneNumber);

  const formatAvail = (availability: {
    [key: string]: { startTime: string; endTime: string };
  }) => {
    if (!availability) {
      return 'N/A';
    }

    return Object.entries(availability)
      .filter(([_, timeRange]) => timeRange?.startTime && timeRange?.endTime)
      .map(
        ([day, timeRange]) =>
          `${day}: ${timeRange.startTime} - ${timeRange.endTime}`
      )
      .join('\n ');
  };

  const parsedAvail = formatAvail(availability!);
  const isAdmin = isDriver !== undefined;
  const isBoth = isDriver && isDriver == true;
  const roles = (): string => {
    if (isBoth) return 'Admin • Driver';
    if (isAdmin) return 'Admin';
    return 'Driver';
  };

  const userInfo = {
    id,
    firstName,
    lastName,
    netId,
    type,
    phone: fmtPhone,
    availability: parsedAvail,
    photoLink,
    startDate,
  };
  return (
    <Link
      to={{
        pathname:
          isAdmin || isBoth
            ? `/admins/${userInfo.id}`
            : `/drivers/${userInfo.id}`,
      }}
      style={{ textDecoration: 'none', color: 'inherit' }}
      className={styles.link}
    >
      <Card
        firstName={firstName}
        lastName={lastName}
        netId={netId}
        photoLink={photoLink}
      >
        <CardInfo icon={phone} alt="phone">
          <p>{fmtPhone}</p>
        </CardInfo>

        <CardInfo icon={clock} alt="clock">
          {parsedAvail ? (
            <p className={styles.timeText}>{parsedAvail}</p>
          ) : (
            <p>N/A</p>
          )}
        </CardInfo>

        <CardInfo
          icon={isAdmin || isBoth ? user : wheel}
          alt={isAdmin || isBoth ? 'admin' : 'wheel'}
        >
          <p>{roles()}</p>
        </CardInfo>
      </Card>
    </Link>
  );
};

const searchableFields = (employee: DriverType | AdminType) => {
  const fields = [
    employee.firstName,
    employee.lastName,
    employee.email,
    employee.phoneNumber,
  ];
  if ('vehicle' in employee && employee.vehicle) {
    fields.push(employee.vehicle.name);
  }
  if ('type' in employee && employee.type) {
    fields.push(...employee.type);
  }
  return fields;
};

const matchesQuery = (rawQuery: string) => {
  const query = rawQuery.toLowerCase();
  return (employee: DriverType | AdminType) =>
    searchableFields(employee).some((field) =>
      field.toLowerCase().includes(query)
    );
};

type EmployeeCardsProps = {
  query: string;
};

const EmployeeCards = ({ query }: EmployeeCardsProps) => {
  const { admins, drivers } = useEmployees();
  const [filterAdmin, setFilterAdmin] = useState(false);
  const [filterDriver, setFilterDriver] = useState(false);

  const employees = useMemo(() => {
    const allEmployees = [...admins, ...drivers];
    const employeeSet: Record<string, DriverType | AdminType> = {};
    allEmployees.forEach((employee) => {
      employeeSet[employee.id] = { ...employeeSet[employee.id], ...employee };
    });
    const sortedEmployees = Object.values(employeeSet)
      .filter((employee) => {
        // if both or neither filters are selected, show all employees
        if (filterAdmin == filterDriver) {
          return true;
        }
        if (filterDriver) {
          return 'availability' in employee;
        }
        if (filterAdmin) {
          return 'type' in employee;
        }
      })
      .sort((a, b) => a.firstName.localeCompare(b.firstName));
    if (!query) {
      return sortedEmployees;
    }
    // By filtering after coalescing step, we keep role info intact
    return sortedEmployees.filter(matchesQuery(query));
  }, [admins, drivers, query, filterAdmin, filterDriver]);

  return (
    <>
      <div className={styles.filtersContainer}>
        <Button
          type="button"
          onClick={() => setFilterDriver((v) => !v)}
          outline={!filterDriver}
        >
          Drivers
        </Button>
        <Button
          type="button"
          onClick={() => setFilterAdmin((v) => !v)}
          outline={!filterAdmin}
        >
          Admins
        </Button>
      </div>
      <div className={styles.cardsContainer}>
        {employees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            id={employee.id}
            employee={employee}
          />
        ))}
      </div>
    </>
  );
};

export default EmployeeCards;
