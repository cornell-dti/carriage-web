import React, { useEffect, useState } from 'react';
import { TableData } from '../../types';
import StatsBox, { StatsBoxProps } from './StatsBox';
import {
  cancel,
  dayRide,
  nightRide,
  noShow,
} from '../../icons/analytics/index';
import styles from './AnalyticsOverview.module.css';
import { useEmployees } from '../../context/EmployeesContext';

type AnalyticsOverviewProps = {
  type: 'ride' | 'driver';
  data: TableData[];
  label: string;
};

const AnalyticsOverview = ({ type, data, label }: AnalyticsOverviewProps) => {
  const [stats, setStats] = useState<StatsBoxProps[]>([]);
  const { drivers } = useEmployees();

  useEffect(() => {
    let newStats;
    if (type === 'ride') {
      const overview = {
        dayRide: 0,
        nightRide: 0,
        noShow: 0,
        cancel: 0,
      };

      data.forEach((stat) => {
        overview.dayRide += stat.dayCount;
        overview.nightRide += stat.nightCount;
        overview.noShow += stat.dayNoShow + stat.nightNoShow;
        overview.cancel += stat.dayCancel + stat.nightNoShow;
      });

      newStats = [
        {
          icon: dayRide,
          alt: 'day',
          stats: overview.dayRide,
          description: 'day rides',
        },
        {
          icon: nightRide,
          alt: 'night',
          stats: overview.nightRide,
          description: 'night rides',
        },
        {
          icon: noShow,
          alt: 'no show',
          stats: overview.noShow,
          description: 'no shows',
        },
        {
          icon: cancel,
          alt: 'cancel',
          stats: overview.cancel,
          description: 'cancels',
        },
      ];
    } else {
      newStats = drivers.map((driver) => {
        const driverStat = data.reduce((acc, curr) => {
          const fullName = `${driver.firstName} ${driver.lastName}`;
          return acc + (curr.drivers[fullName] || 0);
        }, 0);
        return {
          icon: driver.photoLink ? `${driver.photoLink}` : '',
          alt: `${driver.firstName} ${driver.lastName.substr(0, 1)}.`,
          stats: driverStat,
          description: `${driver.firstName} ${driver.lastName.substr(0, 1)}.`,
        };
      });
    }
    setStats([...newStats]);
  }, [data, drivers, type]);

  return (
    <div className={styles.analyticsOverview}>
      <p className={styles.overviewName}>Overview [{label}]</p>
      <div className={styles.statsContainer}>
        {stats.map((stat, idx) => (
          <StatsBox key={idx} {...stat} />
        ))}
      </div>
    </div>
  );
};

export default AnalyticsOverview;
