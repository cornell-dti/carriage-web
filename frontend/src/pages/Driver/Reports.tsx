import React, { useContext, useEffect, useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip } from '@mui/material';
import { useRides } from '../../context/RidesContext';
import AuthContext from '../../context/auth';
import { Ride, Status } from '../../types';

const Reports = () => {
  const { scheduledRides } = useRides();
  const { id: driverId } = useContext(AuthContext);

  const myCompletedRides: Ride[] = useMemo(
    () =>
      scheduledRides.filter(
        (r) => r.driver?.id === driverId && r.status === Status.COMPLETED
      ),
    [scheduledRides, driverId]
  );

  const totals = useMemo(() => {
    const count = myCompletedRides.length;
    const byDay: Record<string, number> = {};
    let totalMinutes = 0;
    myCompletedRides.forEach((r) => {
      const d = new Date(r.startTime).toLocaleDateString();
      byDay[d] = (byDay[d] || 0) + 1;
      const minutes =
        (new Date(r.endTime).getTime() - new Date(r.startTime).getTime()) /
        60000;
      totalMinutes += Math.max(0, Math.round(minutes));
    });
    const avgMinutes = count ? Math.round(totalMinutes / count) : 0;
    return { count, byDay, totalMinutes, avgMinutes };
  }, [myCompletedRides]);

  useEffect(() => {
    document.title = 'Reports - Carriage';
  }, []);

  return (
    <main id="main">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Reports
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Completed Rides
                </Typography>
                <Typography variant="h5">{totals.count}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Minutes
                </Typography>
                <Typography variant="h5">{totals.totalMinutes}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Avg Ride Duration (min)
                </Typography>
                <Typography variant="h5">{totals.avgMinutes}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Completed Rides by Day
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.entries(totals.byDay).map(([day, count]) => (
                <Chip key={day} label={`${day}: ${count}`} />
              ))}
              {!Object.keys(totals.byDay).length && (
                <Typography color="text.secondary">
                  No completed rides yet
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </main>
  );
};

export default Reports;


