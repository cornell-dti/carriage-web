import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Ride } from '../../types';
import UserDetail, { UserContactInfo, OtherInfo } from './UserDetail';
import { phone, clock, wheel, user } from '../../icons/userInfo/index';
import { useReq } from '../../context/req';
import PastRides from './PastRides';
import styles from './userDetail.module.css';
import { clockStats, peopleStats, wheelStats } from '../../icons/employeeStats/index' ;

type EmployeeDetailProps = {
  id: string;
  firstName: string;
  lastName: string;
  netId: string;
  phone: string;
  availability?: string[][];
  admin?: boolean;
};

type EmployeeStatisticsProps = {
  rides: Ride[];
}

type StatisticProps = {
  icon: string;
  stat: number;
  description: string;
}

const EmployeeStatistics = ({ rides } : EmployeeStatisticsProps) => {
  const Statistic = ({ icon, stat, description } : StatisticProps) => {
    return (
      <div className={styles.statistic}>
        <img src={icon} className={styles.statIcon}/>
        <div className={styles.statDescription}>
          {icon === peopleStats ? (
          <h2 className={styles.stat}>{stat}</h2>) : 
          (<h2 className={styles.stat}>{stat}<span className={styles.statsHrs}>hrs</span></h2> )}

          <p>{description}</p>
        </div>
      </div>
    );
  }

  const rideCount = rides.length;
  const hoursDriving = rides.reduce((accumulator, ride) => {
    const startDate = new Date(ride.startTime);
    const endDate = new Date(ride.endTime);
    const diff = Math.abs(endDate.getTime() - startDate.getTime()) / 3600000;
    return diff + accumulator;
  }, 0);

  return (
    <>
    <h3 className={styles.statisticsHeader}>Statistics</h3>
    <div className={styles.employeeStatistics}>
      <h3 className={styles.statisticCardDesc}>Last Week</h3>
      <div className={styles.statsContainer}>
        <Statistic icon={peopleStats} stat={rideCount} description='rides' />
        <Statistic icon={wheelStats} stat={hoursDriving} description='driving' />
      </div>
    </div>
    </>
  );
}


const EmployeeDetail = () => {
  const location = useLocation<EmployeeDetailProps>();
  const employee: EmployeeDetailProps = location.state;
  const availToString = (acc: string, [day, timeRange]: string[]) => `${acc + day}: ${timeRange} • `;
  const parsedAvail = employee.availability ? employee.availability.reduce(availToString, '') : '';
  const avail = parsedAvail.substring(0, parsedAvail.length - 2);
  const [rides, setRides] = useState<Ride[]>([]);
  const { withDefaults } = useReq();

  const isAdmin = employee.availability ? false : true;
  const isBoth = !isAdmin && employee.admin; // admin and driver
  const role = (): string => {
    if (isBoth) return 'Admin • Driver';
    if (isAdmin) return 'Admin';
    return 'Driver';
  }

  const testboolean = true; 
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
    <>
      <UserDetail
        firstName={employee.firstName}
        lastName={employee.lastName}
        netId={employee.netId}
        photoLink={undefined}
      >
        <UserContactInfo icon={phone} alt="" text={employee.phone} />
        <UserContactInfo icon={isAdmin || isBoth ? user : wheel} alt="" text={role()} />
        <UserContactInfo icon={clock} alt="" text={avail === "" ? "N/A" : avail} />
        {/* <OtherInfo>
          <p>last week:</p>
        </OtherInfo> */}
      </UserDetail>
    
    <EmployeeStatistics rides={rides} />

     <PastRides
     isStudent = {false}
     rides={rides}
     />
    </>
  );
};

export default EmployeeDetail;
