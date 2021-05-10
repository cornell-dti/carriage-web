import React from 'react';
import moment from 'moment';
import StatsBox, { StatsBoxProps } from './StatsBox';
import styles from './AnalyticsOverview.module.css';

type AnalyticsOverviewProps = {
  stats: StatsBoxProps[];
};

const month = moment().format('MMMM');

const AnalyticsOverview = ({ stats }: AnalyticsOverviewProps) => (
  <div className={styles.analyticsOverview}>
    <p className={styles.overviewName}>Overview [{month}]</p>
    <div className={styles.statsContainer}>
      {stats.map((stat, idx) => (
        <StatsBox key={idx} {...stat} />
      ))}
    </div>
  </div>
);

export default AnalyticsOverview;
