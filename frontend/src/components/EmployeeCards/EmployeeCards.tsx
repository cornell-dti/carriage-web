import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card, { CardInfo } from '../Card/Card';
import styles from './employeecards.module.css';
import { clock, phone, wheel, user } from '../../icons/userInfo/index';
import { Employee, Admin } from '../../types';
import { useEmployees } from '../../context/EmployeesContext';
import formatAvailability from '../../util/employee';
import { AdminType } from '../../../../server/src/models/admin';
import { DriverType } from '../../../../server/src/models/driver';
import { time } from 'console';

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
type EmployeeDetailProps = {
  id: string;
  firstName: string;
  lastName: string;
  netId: string;
  phone: string;
  availability?: string[][];
  admin?: boolean;
  photoLink?: string;
  startDate?: string;
};
//Convert DriverType to EmployeeType
const DriverToEmployees = (drivers: DriverType[]): EmployeeDetailProps[] => {
  return drivers.map((driver) => ({
    id: driver.id,
    firstName: driver.firstName,
    lastName: driver.lastName,
    availability: formatAvailability(driver.availability)!,
    netId: driver.email.split('@')[0],
    phone: driver.phoneNumber,
    admin: driver.admin,
    photoLink: driver.photoLink,
    startDate: driver.startDate,
  }));
};

//Convert AdminType to EmployeeType
const AdminToEmployees = (admins: AdminType[]): EmployeeDetailProps[] => {
  return admins.map((admin) => ({
    id: admin.id,
    firstName: admin.firstName,
    lastName: admin.lastName,
    netId: admin.email.split('@')[0],
    phone: admin.phoneNumber,
    admin: true,
    photoLink: admin.photoLink,
  }));
};

const findEmployee = (
  drivers: DriverType[],
  admins: AdminType[],
  employeeId: string
): EmployeeDetailProps => {
  const employee = DriverToEmployees(drivers).find(
    (employee) => employee.id === employeeId
  );
  if (!employee)
    return AdminToEmployees(admins).find(
      (employee) => employee.id === employeeId
    )!;
  return employee;
};
const EmployeeCard = ({
  id,
  employee: {
    firstName,
    lastName,
    email,
    phoneNumber,
    availability,
    admin,
    photoLink,
    startDate,
  },
}: EmployeeCardProps) => {
  const { drivers, admins } = useEmployees();
  const [employee, setEmployee] = useState(findEmployee(drivers, admins, id));
  const netId = email.split('@')[0];
  const fmtPhone = formatPhone(phoneNumber);
  let prevTimeRange =
    employee.availability && employee.availability[0]
      ? employee.availability[0][1]
      : '';

  const availToString = (acc: string, [day, timeRange]: string[]) =>
    // need to account for only one time range
    timeRange !== prevTimeRange
      ? acc.charAt(acc.length - 1) === '•'
        ? `${acc + day}: ${timeRange} •`
        : `${acc}: ${prevTimeRange} • ${day}: ${timeRange} `
      : acc !== ''
      ? ((prevTimeRange = timeRange), `${acc + '/' + day}`)
      : ((prevTimeRange = timeRange), `${acc + day}`);

  const parsedAvail = employee.availability
    ? employee.availability.reduce(availToString, '')
    : '';
  let avail = parsedAvail.substring(0, parsedAvail.length);
  avail =
    avail === ''
      ? 'N/A'
      : avail.charAt(avail.length - 1) !== 'm'
      ? avail + ': ' + prevTimeRange
      : avail;

  const isAdmin = !availability;
  const isBoth = !isAdmin && admin; // admin and driver
  const role = (): string => {
    if (isBoth) return 'Admin • Driver';
    if (isAdmin) return 'Admin';
    return 'Driver';
  };

  const userInfo = {
    id,
    firstName,
    lastName,
    netId,
    phone: fmtPhone,
    availability: avail,
    admin,
    photoLink,
    startDate,
  };

  return (
    <Link
      to={{
        pathname: isAdmin
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
          {avail ? <p className={styles.timeText}>{avail}</p> : <p>N/A</p>}
        </CardInfo>

        <CardInfo
          icon={isAdmin || isBoth ? user : wheel}
          alt={isAdmin || isBoth ? 'admin' : 'wheel'}
        >
          <p>{role()}</p>
        </CardInfo>
      </Card>
    </Link>
  );
};

const EmployeeCards = () => {
  const { admins, drivers } = useEmployees();

  const allDrivers = [...admins, ...drivers];
  allDrivers.sort((a: Admin, b: Admin) => {
    if (a.firstName < b.firstName) {
      return -1;
    }
    if (a.firstName > b.firstName) {
      return 1;
    }
    return 0;
  });

  return (
    <div className={styles.cardsContainer}>
      {allDrivers &&
        allDrivers.map((driver) => (
          <EmployeeCard key={driver.id} id={driver.id} employee={driver} />
        ))}
    </div>
  );
};

export default EmployeeCards;
