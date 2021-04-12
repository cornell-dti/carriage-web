import React from 'react';
import StatsBox, { StatsBoxProps } from './StatsBox';
import styles from './AnalyticsOverview.module.css';

type AnalyticsOverviewProps = {
    title: string,
    stats: StatsBoxProps[]
}

const AnalyticsOverview = (
    {title, stats}: AnalyticsOverviewProps) => (
    <div className={styles.analyticsOverview}>
        <p className={styles.title}>{title}</p>
        <div className={styles.statsContainer}>
            {stats.map((stat, idx) => (
                <StatsBox key={idx} {...stat} />
            ))}
        </div>
    </div>
)

export default AnalyticsOverview
