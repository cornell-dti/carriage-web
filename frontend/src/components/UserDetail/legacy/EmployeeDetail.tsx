import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Ride } from '../../../types';
import UserDetail, { UserContactInfo } from './UserDetail';
import UserStatistics from './UserStatistics';
import UserActions from './UserActions';
import {
  phone,
  clock,
  wheel,
  user,
  calender_dark,
} from '../../../icons/userInfo/index';
import { RideTable } from '../../RideDetails';
import styles from './userDetail.module.css';
import { AdminType } from '../../../../../server/src/models/admin';
import { DriverType } from '../../../../../server/src/models/driver';
import axios from '../../../util/axios';

type EmployeeDetailProps = {
  id: string;
  firstName: string;
  lastName: string;
  type?: string[];
  isDriver?: boolean;
  netId: string;
  phoneNumber: string;
  availability?: string[];
  photoLink?: string;
};


const DriverToEmployees = (drivers: DriverType[]): EmployeeDetailProps[] => {
  return drivers.map((driver) => ({
    id: driver.id,
    firstName: driver.firstName,
    lastName: driver.lastName,
    netId: driver.email.split('@')[0],
    phoneNumber: driver.phoneNumber,
    photoLink: driver.photoLink,
  }));
};

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
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/admin/employees');
  };

  return (
    <Box className={styles.pageDivTitle}>
      <Button
        startIcon={<ArrowBack />}
        onClick={handleBack}
        sx={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          color: 'inherit',
          textTransform: 'none',
          padding: 0,
          minWidth: 'auto',
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }}
      >
        Employees
      </Button>
    </Box>
  );
};

const EmployeeDetail = () => {
  const { id: employeeId } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<EmployeeDetailProps>();
  const location = useLocation();
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

  const fetchAllRides = async (employeeId: any) => {
    const res = await axios.get(`/api/rides?driver=${employeeId}&allDates=true`);
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
            });
            setEmployeeRides(employeeId);
            setEmployeeStats(employeeId);
          });
        } else {
          setEmployee({
            ...adminData,
            ...{ netId: adminData.email.split('@')[0] },
            availability: adminData.availability,
          });
        }
      });
    } else if (userType === 'drivers') {
      fetchDriverData(employeeId).then((driverData) => {
        setEmployee({
          ...driverData,
          ...{ netId: driverData.email.split('@')[0] },
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
    fetchAllRides(employeeId).then((data) => {
      setRides(data.sort(compRides));
    });
  };

  useEffect(() => {
    if (employeeId && userType) {
      setEmployeeData(employeeId, userType);
    }
  }, [employeeId, userType]);

  if (employee) {
    const isAdmin = employee.isDriver !== undefined;
    const isBoth = employee.isDriver ?? false;
    const avail = employee.availability
      ? employee.availability.join(' • ')
      : '';

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
        <Box className={styles.pageContainer}>
          {/* User Information Section */}
          <Box className={styles.userInformationSection}>
            <Box className={styles.userInfoContainer}>
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
              </UserDetail>
            </Box>
            
            <Box className={styles.statisticsContainer}>
              <UserStatistics
                role={roleValue() as 'driver' | 'admin' | 'both'}
                rideCount={rideCount}
                hours={workingHours}
              />
            </Box>
            
            <Box className={styles.actionsContainer}>
              <UserActions
                role={roleValue() as 'driver' | 'admin' | 'both'}
                employee={employee}
              />
            </Box>
          </Box>
          
          {/* Rides Table Section */}
          <Box className={styles.ridesTableSection}>
            <RideTable rides={rides} userRole="admin" />
          </Box>
        </Box>
      </main>
    );
  }
  return null;
};

export default EmployeeDetail;
