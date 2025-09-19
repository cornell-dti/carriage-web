import React from 'react';
import moment from 'moment';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Grid,
} from '@mui/material';
import { Ride, SchedulingState } from '../../types/index';
import { format_date } from '../../util/index';

type RideDetailsModalProps = {
  open: boolean;
  close: () => void;
  ride: Ride;
};

const RideDetailsModal = ({ open, close, ride }: RideDetailsModalProps) => {
  const startTime = moment(ride.startTime).format('h:mm A');
  const endTime = moment(ride.endTime).format('h:mm A');
  const date = format_date(ride.startTime);
  // For display purposes, use primary rider (first in array) or show multiple riders
  const getRiderDisplayName = () => {
    if (!ride.riders || ride.riders.length === 0) return 'No rider assigned';
    if (ride.riders.length === 1)
      return `${ride.riders[0].firstName} ${ride.riders[0].lastName}`;
    return `${ride.riders[0].firstName} ${ride.riders[0].lastName} +${
      ride.riders.length - 1
    } more`;
  };

  const riderName = getRiderDisplayName();
  const driverName = ride.driver
    ? `${ride.driver.firstName} ${ride.driver.lastName}`
    : 'No driver assigned';

  const pickupLocation = ride.startLocation.name || ride.startLocation.address;
  const dropoffLocation = ride.endLocation.name || ride.endLocation.address;

  // Collect accessibility needs from all riders
  const getAllAccessibilityNeeds = () => {
    if (!ride.riders || ride.riders.length === 0) return 'None';
    const allNeeds = ride.riders
      .filter((rider) => rider.accessibility && rider.accessibility.length > 0)
      .flatMap((rider) => rider.accessibility)
      .filter((need, index, arr) => arr.indexOf(need) === index); // Remove duplicates
    return allNeeds.length > 0 ? allNeeds.join(', ') : 'None';
  };

  const needs = getAllAccessibilityNeeds();

  const getStatusText = () => {
    if (ride.schedulingState === SchedulingState.UNSCHEDULED) {
      return 'Requested';
    } else if (ride.type === 'active') {
      return 'Confirmed';
    } else if (ride.type === 'past') {
      return 'Completed';
    } else {
      return 'Unknown';
    }
  };

  const getStatusColor = ():
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    if (ride.schedulingState === SchedulingState.UNSCHEDULED) {
      return 'warning';
    } else if (ride.type === 'active') {
      return 'success';
    } else if (ride.type === 'past') {
      return 'info';
    } else {
      return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={close} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div" className="font-semibold">
          Ride Details
        </Typography>
      </DialogTitle>
      <DialogContent className="p-6">
        <Box className="space-y-6">
          {/* Basic Information */}
          <Box>
            <Typography variant="h6" className="font-medium mb-3 text-gray-800">
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  className="text-gray-600 font-medium"
                >
                  Date
                </Typography>
                <Typography variant="body1" className="text-gray-900">
                  {date}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  className="text-gray-600 font-medium"
                >
                  Status
                </Typography>
                <Chip
                  label={getStatusText()}
                  color={getStatusColor()}
                  size="small"
                  className="mt-1"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  className="text-gray-600 font-medium"
                >
                  Pickup Time
                </Typography>
                <Typography variant="body1" className="text-gray-900">
                  {startTime}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  className="text-gray-600 font-medium"
                >
                  Dropoff Time
                </Typography>
                <Typography variant="body1" className="text-gray-900">
                  {endTime}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* People */}
          <Box>
            <Typography variant="h6" className="font-medium mb-3 text-gray-800">
              People
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  className="text-gray-600 font-medium"
                >
                  Rider
                </Typography>
                <Typography variant="body1" className="text-gray-900">
                  {riderName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  className="text-gray-600 font-medium"
                >
                  Driver
                </Typography>
                <Typography variant="body1" className="text-gray-900">
                  {driverName}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Locations */}
          <Box>
            <Typography variant="h6" className="font-medium mb-3 text-gray-800">
              Locations
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  className="text-gray-600 font-medium"
                >
                  Pickup Location
                </Typography>
                <Typography variant="body1" className="text-gray-900">
                  {pickupLocation}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  className="text-gray-600 font-medium"
                >
                  Dropoff Location
                </Typography>
                <Typography variant="body1" className="text-gray-900">
                  {dropoffLocation}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Additional Information */}
          <Box>
            <Typography variant="h6" className="font-medium mb-3 text-gray-800">
              Additional Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  className="text-gray-600 font-medium"
                >
                  Accessibility Needs
                </Typography>
                <Typography variant="body1" className="text-gray-900">
                  {needs}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  className="text-gray-600 font-medium"
                >
                  Recurring
                </Typography>
                <Typography variant="body1" className="text-gray-900">
                  {ride.isRecurring ? 'Yes' : 'No'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className="p-6 pt-0">
        <Button onClick={close} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RideDetailsModal;
