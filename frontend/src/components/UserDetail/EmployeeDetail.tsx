import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Ride } from '../../types';
import UserDetail, { UserContactInfo } from './UserDetail';
import {
  phone,
  clock,
  wheel,
  user,
  calender_dark,
} from '../../icons/userInfo/index';
import PastRides from './PastRides';
import styles from './userDetail.module.css';
import { peopleStats, wheelStats } from '../../icons/stats/index';
import formatAvailability from '../../util/employee';
import { useEmployees } from '../../context/EmployeesContext';
import { AdminType } from '../../../../server/src/models/admin';
import { DriverType } from '../../../../server/src/models/driver';
import { chevronLeft } from '../../icons/other';
import axios from '../../util/axios';

type EmployeeDetailProps = {
  id: string;
  firstName: string;
  lastName: string;
  type?: string[];
  isDriver?: boolean;
  netId: string;
  phoneNumber: string;
  availability?: string[][];
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
    phoneNumber: driver.phoneNumber,
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
    netId: admin.email.split('@')[0],
    phoneNumber: admin.phoneNumber,
    photoLink: admin.photoLink,
  }));
};

const findEmployee = (
  drivers: DriverType[],
  admins: AdminType[],
  employeeId: string
): EmployeeDetailProps => {
  const employee = AdminToEmployees(admins).find(
    (employee) => employee.id === employeeId
  );
  console.log(employee);
  if (!employee)
    return DriverToEmployees(drivers).find(
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
        <img
          className={styles.chevronLeft}
          src={chevronLeft}
          alt="Back to Employees List"
        />
        Employees
      </Link>
    </div>
  );
};

const EmployeeDetail = () => {
  const { id: employeeId } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<EmployeeDetailProps>();
  const pathArr = location.pathname.split('/');
  const [userType, setUserType] = useState<string>(pathArr[2]);

  const [rides, setRides] = useState<Ride[]>([]);
  const [rideCount, setRideCount] = useState(-1);
  const [workingHours, setWorkingHours] = useState(-1);

  /**
   * Compares ride [a] with ride [b] based on their start time. Returns a
   * negative number if [a] starts before [b], a positive number if [a] starts
   * after [b], and 0 otherwise
   *
   * @param a the first ride to compare
   * @param b the second ride to compare
   * @returns -1, 1, or 0 if the start time of [a] is before, after, or the same as [b]
   */
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

  const fetchAdminData = async (employeeId: any) => {
    const res = await axios.get(`/api/admins/${employeeId}`);
    return res.data.data;
  };

  const fetchDriverData = async (employeeId: any) => {
    const res = await axios.get(`/api/drivers/${employeeId}`);
    return res.data.data;
  };

  const fetchStats = async (employeeId: any) => {
    const res = await axios.get(`/api/drivers/${employeeId}/stats`);
    return res.data.data;
  };

  const fetchPastRides = async (employeeId: any) => {
    const res = await axios.get(`/api/rides?type=past&driver=${employeeId}`);
    return res.data.data;
  };

  const setEmployeeData = (employeeId: string, userType: string) => {
    if (userType === 'admins') {
      fetchAdminData(employeeId).then((adminData) => {
        if (adminData.isDriver) {
          fetchDriverData(employeeId).then((driverData) => {
            setEmployee({
              ...driverData,
              ...adminData,
              ...{ netId: adminData.email.split('@')[0] },
              availability: formatAvailability(driverData.availability),
            });
            setEmployeeRides(employeeId);
            setEmployeeStats(employeeId);
          });
        } else {
          setEmployee({
            ...adminData,
            ...{ netId: adminData.email.split('@')[0] },
            availability: formatAvailability(adminData.availability),
          });
        }
      });
    } else if (userType === 'drivers') {
      fetchDriverData(employeeId).then((driverData) => {
        setEmployee({
          ...driverData,
          ...{ netId: driverData.email.split('@')[0] },
          availability: formatAvailability(driverData.availability),
        });
        setEmployeeRides(employeeId);
        setEmployeeStats(employeeId);
      });
    }
  };

  const setEmployeeStats = (employeeId: string) => {
    fetchStats(employeeId).then((data) => {
      if (!data.err) {
        setRideCount(Math.floor(data.rides));
        setWorkingHours(Math.floor(data.workingHours));
      }
    });
  };

  const setEmployeeRides = (employeeId: string) => {
    fetchPastRides(employeeId).then((data) => {
      setRides(data.sort(compRides));
    });
  };

  useEffect(() => {
    setEmployeeData(employeeId, userType);
  }, [employeeId, userType]);

  if (employee) {
    const isAdmin = employee.isDriver !== undefined;
    const isBoth = employee.isDriver ?? false; // isDriver is only for admins + also driver if true
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
            <UserContactInfo
              icon={phone}
              alt="phone"
              text={employee.phoneNumber}
            />
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
          {/* <PastRides isStudent={false} rides={rides} /> */}
        </div>
      </main>
    );
  }
  return null;
};

export default EmployeeDetail;
