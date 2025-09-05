import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import { useRides } from '../../context/RidesContext';
import { useDate } from '../../context/date';
import AuthContext from '../../context/auth';
import { Ride, Status } from '../../types';
import EnhancedTable from '../../components/Table/EnhancedTable';
import { todaysRides } from './todaysRides';

const getStatusColor = (status: Status) => {
  switch (status) {
    case Status.NOT_STARTED:
      return 'default';
    case Status.ON_THE_WAY:
      return 'primary';
    case Status.ARRIVED:
      return 'info';
    case Status.PICKED_UP:
      return 'warning';
    case Status.COMPLETED:
      return 'success';
    case Status.NO_SHOW:
    case Status.CANCELLED:
      return 'error';
    default:
      return 'default';
  }
};

const NextRideCard = ({ nextRide }: { nextRide: Ride | undefined }) => {
  if (!nextRide) {
    return (
      <Card sx={{ mb: 3, width: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            No upcoming rides scheduled
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3, width: '100%' }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Typography variant="h6">Your Next Ride</Typography>
          <Chip
            label={nextRide.status.replace('_', ' ')}
            color={getStatusColor(nextRide.status)}
            size="small"
          />
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={3}>
            <Typography color="textSecondary" variant="subtitle2">
              Rider
            </Typography>
            <Typography variant="body1">
              {`${nextRide.rider.firstName} ${nextRide.rider.lastName}`}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography color="textSecondary" variant="subtitle2">
              Pick up
            </Typography>
            <Typography variant="body1">
              {nextRide.startLocation.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {nextRide.startLocation.address}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography color="textSecondary" variant="subtitle2">
              Drop off
            </Typography>
            <Typography variant="body1">{nextRide.endLocation.name}</Typography>
            <Typography variant="caption" color="textSecondary">
              {nextRide.endLocation.address}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography color="textSecondary" variant="subtitle2">
              Time
            </Typography>
            <Typography variant="body1">
              {new Date(nextRide.startTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
            {nextRide.recurring && (
              <Typography variant="caption" color="textSecondary">
                Recurring
              </Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const Rides = () => {
  const { scheduledRides } = useRides();
  const { curDate } = useDate();
  const authContext = useContext(AuthContext);
  const [viewFilter, setViewFilter] = useState<'all' | 'my-rides'>('all');

  // Filter rides based on view selection
  const filteredRides =
    viewFilter === 'all'
      ? todaysRides
      : todaysRides.filter((ride) => ride.driver?.id === authContext.id);

  // Find the next ride for the logged-in driver
  const nextDriverRide = todaysRides
    .filter(
      (ride) =>
        ride.driver?.id === authContext.id &&
        new Date(ride.startTime) > new Date()
    )
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )[0];

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: 'all' | 'my-rides'
  ) => {
    if (newView !== null) {
      setViewFilter(newView);
    }
  };

  const handleExport = () => {
    console.log('Exporting rides...');
  };

  const handleSendEmail = () => {
    console.log('Sending email...');
  };

  useEffect(() => {
    document.title = 'Rides - Carriage';
  }, []);

  return (
    <main id="main">
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            Today's Rides
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<EmailIcon />}
              onClick={handleSendEmail}
            >
              Send Email
            </Button>
          </Box>
        </Box>

        {/* Next Ride Card */}
        <NextRideCard nextRide={nextDriverRide} />

        {/* View Filter */}
        <Box sx={{ mb: 2 }}>
          <ToggleButtonGroup
            value={viewFilter}
            exclusive
            onChange={handleViewChange}
            aria-label="view filter"
            size="small"
          >
            <ToggleButton value="all" aria-label="show all rides">
              All Rides
            </ToggleButton>
            <ToggleButton value="my-rides" aria-label="show my rides">
              My Rides
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Rides Table */}
        <EnhancedTable rides={filteredRides} />
      </Box>
    </main>
  );
};

export default Rides;