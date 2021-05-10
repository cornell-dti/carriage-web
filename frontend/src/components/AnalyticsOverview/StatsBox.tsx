import React from 'react';
import styles from './AnalyticsOverview.module.css';

export type StatsBoxProps = {
  icon: string;
  alt: string;
  stats: string | number;
  description: string;
};

const StatsBox = ({ icon, alt, stats, description }: StatsBoxProps) => (
  <div className={styles.statsbox}>
    <div className={styles.left}>
      <img className={styles.icon} src={icon} alt={alt} />
    </div>
    <div className={styles.right}>
      <p className={styles.stats}>{stats}</p>
      <p className={styles.description}>{description}</p>
    </div>
  </div>
);

export default StatsBox;
