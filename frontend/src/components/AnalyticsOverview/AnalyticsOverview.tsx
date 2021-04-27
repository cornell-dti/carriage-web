import React from 'react';
import StatsBox, { StatsBoxProps } from './StatsBox';
import styles from './AnalyticsOverview.module.css';

type AnalyticsOverviewProps = {
  stats: StatsBoxProps[];
};

const AnalyticsOverview = ({ stats }: AnalyticsOverviewProps) => (
  <div className={styles.analyticsOverview}>
    <div className={styles.statsContainer}>
      {stats.map((stat, idx) => (
        <StatsBox key={idx} {...stat} />
      ))}
    </div>
  </div>
);

export default AnalyticsOverview;
