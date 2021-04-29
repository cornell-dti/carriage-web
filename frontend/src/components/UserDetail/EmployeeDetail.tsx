import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Ride } from '../../types';
import UserDetail, { UserContactInfo, OtherInfo } from './UserDetail';
import { phone, clock, wheel, user } from '../../icons/userInfo/index';
import { useReq } from '../../context/req';
import PastRides from './PastRides';

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
  const employee: EmployeeDetailProps = location.state;
  const availToString = (acc: string, [day, timeRange]: string[]) => `${acc + day}: ${timeRange} • `;
  const parsedAvail = employee.availability ? employee.availability.reduce(availToString, '') : '';
  const avail = parsedAvail.substring(0, parsedAvail.length - 2);
  const [rides, setRides] = useState<Ride[]>([]);
  const { withDefaults } = useReq();

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

  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  useEffect(() => {
    fetch(`/api/rides?type=past&driver=${employee.id}`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => setRides(data.sort(compRides)));
  }, [withDefaults, employee.id]);

  return (
    <main id = "main">
      <section>
        <UserDetail
          firstName={employee.firstName}
          lastName={employee.lastName}
          netId={employee.netId}
          employee={employee}
          role={roleValue()}
          photoLink={employee.photoLink}
        >
          <UserContactInfo icon={phone} alt="phone" text={employee.phone} />
          <UserContactInfo icon={isAdmin || isBoth ? user : wheel} alt="role" text={role()} />
          <UserContactInfo icon={clock} alt="availability" text={avail === '' ? 'N/A' : avail} />
          <OtherInfo>
            <p>last week:</p>
          </OtherInfo>
        </UserDetail>
      </section>
      <section>
        <PastRides
          isStudent={false}
          rides={rides}
        />
      </section>
    </main>
  );
};

export default EmployeeDetail;
