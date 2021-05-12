import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Ride } from '../../types';
import UserDetail, { UserContactInfo, OtherInfo } from './UserDetail';
import { phone, clock, wheel, user } from '../../icons/userInfo/index';
import { useReq } from '../../context/req';
import PastRides from './PastRides';
import formatAvailability from '../../util/employee';

type EmployeeDetailProps = {
  id: string;
  firstName: string;
  lastName: string;
  netId: string;
  phone: string;
  availability?: string[][];
  admin?: boolean;
  photoLink?: string;
};

const EmployeeDetail = () => {
  const location = useLocation<EmployeeDetailProps>();
  const [employee, setEmployee] = useState(location.state);
  const pathArr = location.pathname.split('/');
  const userType = pathArr[1];
  const { id: employeeId } = useParams<{ id: string }>();

  const [rides, setRides] = useState<Ride[]>([]);
  const { withDefaults } = useReq();

  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

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
      }
    }
    fetch(`/api/rides?type=past&driver=${employeeId}`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => setRides(data.sort(compRides)));
  }, [employeeId, employee, withDefaults, userType]);

  if (employee) {
    const availToString = (acc: string, [day, timeRange]: string[]) => `${acc + day}: ${timeRange} • `;
    const parsedAvail = employee.availability ? employee.availability.reduce(availToString, '') : '';
    const avail = parsedAvail.substring(0, parsedAvail.length - 2);
    const isAdmin = !employee.availability;
    const isBoth = !isAdmin && employee.admin; // admin and driver
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
      <>
        <UserDetail
          firstName={employee.firstName}
          lastName={employee.lastName}
          netId={employee.netId}
          employee={employee}
          role={roleValue()}
          photoLink={employee.photoLink}
        >
          <UserContactInfo icon={phone} alt="" text={employee.phone} />
          <UserContactInfo icon={isAdmin || isBoth ? user : wheel} alt="" text={role()} />
          <UserContactInfo icon={clock} alt="" text={avail === '' ? 'N/A' : avail} />
          <OtherInfo>
            <p>last week:</p>
          </OtherInfo>
        </UserDetail>

        <PastRides
          isStudent={false}
          rides={rides}
        />
      </>
    );
  }
  return (<></>);
};

export default EmployeeDetail;
