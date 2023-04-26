import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card, { CardInfo } from '../Card/Card';
import styles from './employeecards.module.css';
import { clock, phone, wheel, user } from '../../icons/userInfo/index';
import { Employee, Admin, Driver } from '../../types';
import { useEmployees } from '../../context/EmployeesContext';
import formatAvailability from '../../util/employee';
import { AdminType } from '../../../../server/src/models/admin';
import { DriverType } from '../../../../server/src/models/driver';

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
  role?: string[];
  driverId?: string;
  netId: string;
  phone: string;
  availability?: string[][];
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
    type: admin.type,
    isDriver: admin.isDriver,
    availability: formatAvailability(admin.availability)!,
    netId: admin.email.split('@')[0],
    phone: admin.phoneNumber,
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
      .filter(([day, timeRange]) => timeRange?.startTime && timeRange?.endTime)
      .map(
        ([day, timeRange]) =>
          `${day}: ${timeRange.startTime} - ${timeRange.endTime}`
      )
      .join('\n ');
  };

  const parsedAvail = formatAvail(availability!);
  const isAdmin = !availability;
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

const EmployeeCards = () => {
  const { admins, drivers } = useEmployees();

  const allEmployees = [...admins, ...drivers];
  const adminIds = new Set(admins.map((admin) => admin.id));
  const filteredEmployees = allEmployees.filter((employee: Employee) => {
    // if not admin (means driver), check if another admin is representing this driver
    if (employee['isDriver'] == undefined) return !adminIds.has(employee.id);
    return true;
  });

  filteredEmployees.sort((a: Employee, b: Employee) => {
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
      {filteredEmployees &&
        filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            id={employee.id}
            employee={employee}
          />
        ))}
    </div>
  );
};

export default EmployeeCards;
