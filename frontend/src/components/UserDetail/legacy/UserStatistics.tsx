import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { peopleStats, wheelStats } from '../../../icons/stats/index';
import styles from './UserStatistics.module.css';

type UserRole = 'driver' | 'admin' | 'rider' | 'both';

type StatisticData = {
  icon: string;
  value: number;
  label: string;
  unit?: string;
  alt: string;
};

type UserStatisticsProps = {
  role: UserRole;
  rideCount?: number;
  hours?: number;
  className?: string;
};

const UserStatistics = ({
  role,
  rideCount = -1,
  hours = -1,
  className,
}: UserStatisticsProps) => {
  const getStatistics = (): StatisticData[] => {
    const stats: StatisticData[] = [];

    // Add rides statistic for drivers and admins who are drivers
    if (role === 'driver' || role === 'both' || role === 'admin') {
      stats.push({
        icon: peopleStats,
        value: rideCount,
        label: 'rides',
        alt: 'rides',
      });
    }

    // Add hours statistic for drivers
    if (role === 'driver' || role === 'both') {
      stats.push({
        icon: wheelStats,
        value: hours,
        label: 'driving',
        unit: 'hrs',
        alt: 'hours',
      });
    }

    return stats;
  };

  const statistics = getStatistics();

  if (statistics.length === 0) {
    return null;
  }

  return (
    <Card
      className={`${styles.statisticsContainer} ${className || ''}`}
      elevation={2}
    >
      <CardContent className={styles.statisticsCardContent}>
        <Typography variant="h6" className={styles.userDetailHeader}>
          Statistics (Last Week)
        </Typography>
        <Grid container spacing={2} className={styles.statisticsGrid}>
          {statistics.map((stat, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card className={styles.statisticCard} elevation={1}>
                <CardContent className={styles.cardContent}>
                  <Box className={styles.statIconContainer}>
                    <img
                      src={stat.icon}
                      className={styles.statIcon}
                      alt={stat.alt}
                    />
                  </Box>
                  <Box className={styles.statDescription}>
                    {stat.value >= 0 ? (
                      <Typography variant="h4" className={styles.stat}>
                        {stat.value}
                        {stat.unit && (
                          <Typography
                            component="span"
                            className={styles.statsUnit}
                          >
                            {stat.unit}
                          </Typography>
                        )}
                      </Typography>
                    ) : (
                      <Typography variant="h4" className={styles.stat}>
                        N/A
                      </Typography>
                    )}
                    <Typography variant="body2" className={styles.statLabel}>
                      {stat.label}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default UserStatistics;
