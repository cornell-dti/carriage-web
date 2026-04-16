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
      className={`m-0 w-full rounded-xl h-fit ${className || ''}`}
      elevation={2}
    >
      <CardContent className="p-6">
        <Typography variant="h6" className="text-lg font-semibold text-[#333] mb-4">
          Statistics (Last Week)
        </Typography>
        <Grid container spacing={2} className="gap-4">
          {statistics.map((stat, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card className="bg-white rounded-xl transition-all duration-200 cursor-default hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)]" elevation={1}>
                <CardContent className="p-5 flex flex-row items-center gap-4 max-md:p-4">
                  <Box className="flex items-center justify-center w-12 h-12 bg-[#f8f9fa] rounded-lg shrink-0 max-md:w-10 max-md:h-10">
                    <img
                      src={stat.icon}
                      className="w-7 h-7 max-md:w-6 max-md:h-6"
                      alt={stat.alt}
                    />
                  </Box>
                  <Box className="flex flex-col gap-1 grow">
                    {stat.value >= 0 ? (
                      <Typography variant="h4" className="text-[1.75rem] font-bold m-0 text-[#1a1a1a] leading-tight max-md:text-2xl">
                        {stat.value}
                        {stat.unit && (
                          <Typography
                            component="span"
                            className="text-sm font-normal ml-1 text-[#6b7280]"
                          >
                            {stat.unit}
                          </Typography>
                        )}
                      </Typography>
                    ) : (
                      <Typography variant="h4" className="text-[1.75rem] font-bold m-0 text-[#1a1a1a] leading-tight max-md:text-2xl">
                        N/A
                      </Typography>
                    )}
                    <Typography variant="body2" className="text-sm text-[#6b7280] m-0 uppercase font-medium tracking-wide">
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
