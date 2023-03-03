import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Ride } from '../../types';
import UserDetail, { UserContactInfo } from './UserDetail';
import {
  phone,
  clock,
  wheel,
  user,
  calender_dark,
} from '../../icons/userInfo/index';
import { useReq } from '../../context/req';
import PastRides from './PastRides';
import styles from './userDetail.module.css';
import { peopleStats, wheelStats } from '../../icons/stats/index';
import formatAvailability from '../../util/employee';
import { useEmployees } from '../../context/EmployeesContext';
import { AdminType } from '../../../../server/src/models/admin';
import { DriverType } from '../../../../server/src/models/driver';
import { chevronLeft } from '../../icons/other';

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

type EmployeeStatisticsProps = {
  rideCount: number;
  hours: number;
};

type StatisticProps = {
  icon: string;
  stat: number;
  alt: string;
  description: string;
};

const EmployeeStatistics = ({ rideCount, hours }: EmployeeStatisticsProps) => {
  const Statistic = ({ icon, stat, description, alt }: StatisticProps) => (
    <div className={styles.statistic}>
      <img src={icon} className={styles.statIcon} alt={alt} />
      <div className={styles.statDescription}>
        {stat >= 0 ? (
          <>
            {icon === peopleStats ? (
              <h2 className={styles.stat}>{stat}</h2>
            ) : (
              <h2 className={styles.stat}>
                {stat}
                <span className={styles.statsHrs}>hrs</span>
              </h2>
            )}
          </>
        ) : (
          <p className={styles.stat}>N/A</p>
        )}
        <p>{description}</p>
      </div>
    </div>
  );

  return (
    <div className={styles.statisticsContainer}>
      <h3 className={styles.userDetailHeader}>Statistics</h3>
      <div className={styles.employeeStatistics}>
        <h3 className={styles.statisticCardDesc}>Last Week</h3>
        <div className={styles.statsContainer}>
          <Statistic
            icon={peopleStats}
            stat={rideCount}
            description="rides"
            alt="people"
          />
          <Statistic
            icon={wheelStats}
            stat={hours}
            description="driving"
            alt="people"
          />
        </div>
      </div>
    </div>
  );
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

const Header = () => {
  return (
    <div className={styles.pageDivTitle}>
      <Link
        to={{
          pathname: '/employees',
        }}
        className={styles.header}
      >
        <img className={styles.chevronLeft} src={chevronLeft} />
        Employees
      </Link>
    </div>
  );
};

const EmployeeDetail = () => {
  const { id: employeeId } = useParams<{ id: string }>();
  const { drivers, admins } = useEmployees();
  const [employee, setEmployee] = useState(
    findEmployee(drivers, admins, employeeId)
  );
  const pathArr = location.pathname.split('/');
  const userType = pathArr[2];

  const [rides, setRides] = useState<Ride[]>([]);
  const [rideCount, setRideCount] = useState(-1);
  const [workingHours, setWorkingHours] = useState(-1);
  const { withDefaults } = useReq();

  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  useEffect(() => {
    if (employee) {
      document.title = `${employee.firstName} ${employee.lastName} - Carriage`;
    } else {
      document.title = 'Employee Details - Carriage';
    }
  }, [employee]);

  useEffect(() => {
    if (!employee && employeeId) {
      if (userType === 'admins') {
        fetch(`/api/admins/${employeeId}`, withDefaults())
          .then((res) => res.json())
          .then((admin) => {
            setEmployee({
              ...admin,
              availability: '',
              phone: admin.phoneNumber,
            });
          });
      } else {
        fetch(`/api/drivers/${employeeId}`, withDefaults())
          .then((res) => res.json())
          .then((driver) => {
            setEmployee({
              ...driver,
              availability: formatAvailability(driver.availability),
              phone: driver.phoneNumber,
            });
          });
        fetch(`/api/drivers/${employeeId}/stats`, withDefaults())
          .then((res) => res.json())
          .then((data) => {
            if (!data.err) {
              setRideCount(Math.floor(data.rides));
              setWorkingHours(Math.floor(data.workingHours));
            }
          });
      }
    }
    fetch(`/api/rides?type=past&driver=${employeeId}`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => setRides(data.sort(compRides)));
    setEmployee(findEmployee(drivers, admins, employeeId));
  }, [admins, drivers, employeeId, withDefaults, userType]);

  if (employee) {
    const isAdmin = !employee.availability;
    const isBoth = !isAdmin && employee.admin; // admin and driver
    const availToString = (acc: string, [day, timeRange]: string[]) =>
      `${acc + day}: ${timeRange} • `;
    const parsedAvail = employee.availability
      ? employee.availability.reduce(availToString, '')
      : '';
    const avail = parsedAvail.substring(0, parsedAvail.length - 2);

    const role = (): string => {
      if (isBoth) return 'Admin • Driver';
      if (isAdmin) return 'Admin';
      return 'Driver';
    };
    const roleValue = (): string => {
      if (isBoth) return 'both';
      if (isAdmin) return 'admin';
      return 'driver';
    };

    return (
      <main id="main">
        <Header />
        <div className={styles.detailContainer}>
          <UserDetail
            firstName={employee.firstName}
            lastName={employee.lastName}
            netId={employee.netId}
            employee={employee}
            role={roleValue()}
            photoLink={employee.photoLink}
          >
            <UserContactInfo icon={phone} alt="phone" text={employee.phone} />
            <UserContactInfo
              icon={isAdmin || isBoth ? user : wheel}
              alt="role"
              text={role()}
            />
            <UserContactInfo
              icon={clock}
              alt="availability"
              text={avail === '' ? 'N/A' : avail}
            />
            {employee.startDate && (
              <UserContactInfo
                icon={calender_dark}
                alt="join date"
                text={employee.startDate}
              />
            )}
          </UserDetail>
          <EmployeeStatistics rideCount={rideCount} hours={workingHours} />
          <PastRides isStudent={false} rides={rides} />
        </div>
      </main>
    );
  }
  return null;
};

export default EmployeeDetail;
