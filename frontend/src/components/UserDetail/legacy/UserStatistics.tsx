import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { peopleStats, wheelStats } from '../../../icons/stats/index';

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
      className={`statisticsContainer} ${className || ''}`}
      elevation={2}
    >
      <CardContent statisticsCardContent}>
        <Typography variant="h6" userDetailHeader}>
          Statistics (Last Week)
        </Typography>
        <Grid container spacing={2} statisticsGrid}>
          {statistics.map((stat, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card statisticCard} elevation={1}>
                <CardContent cardContent}>
                  <Box statIconContainer}>
                    <img
                      src={stat.icon}
                      statIcon}
                      alt={stat.alt}
                    />
                  </Box>
                  <Box statDescription}>
                    {stat.value >= 0 ? (
                      <Typography variant="h4" stat}>
                        {stat.value}
                        {stat.unit && (
                          <Typography
                            component="span"
                            statsUnit}
                          >
                            {stat.unit}
                          </Typography>
                        )}
                      </Typography>
                    ) : (
                      <Typography variant="h4" stat}>
                        N/A
                      </Typography>
                    )}
                    <Typography variant="body2" statLabel}>
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
