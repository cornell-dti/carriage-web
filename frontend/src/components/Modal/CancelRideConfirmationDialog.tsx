import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { RideType, SchedulingState } from '../../types';
import { UserRole } from '../../util/rideValidation';
import axios from '../../util/axios';
import { useToast, ToastStatus } from '../../context/toastContext';
import { useRides } from '../../context/RidesContext';

interface CancelRideConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  ride: RideType;
  userRole?: UserRole;
  onSuccess?: () => void;
}

const CancelRideConfirmationDialog: React.FC<
  CancelRideConfirmationDialogProps
> = ({ open, onClose, ride, userRole: propUserRole, onSuccess }) => {
  const { showToast } = useToast();
  const { refreshRides } = useRides();

  // Get user role from localStorage if not provided as prop
  const getUserRole = (): UserRole => {
    if (propUserRole) return propUserRole;
    const userType = localStorage.getItem('userType');
    if (userType === 'Admin') return 'admin';
    if (userType === 'Driver') return 'driver';
    if (userType === 'Rider') return 'rider';
    return 'rider';
  };

  const userRole = getUserRole();

  const handleCancelConfirm = async () => {
    // Check for recurring rides (not supported yet)
    if (ride.isRecurring) {
      showToast('Recurring ride deletion not supported yet', ToastStatus.ERROR);
      return;
    }

    // Only admins can reject rides; riders can only cancel
    // If ride has no driver (unscheduled) AND user is admin, reject it
    if (!ride.driver && userRole === 'admin') {
      try {
        // Set schedulingState to REJECTED
        await axios.put(`/api/rides/${ride.id}`, {
          schedulingState: SchedulingState.REJECTED,
        });

        // Close the cancel confirmation modal
        onClose();

        // Refresh the rides data
        refreshRides();

        // Show success message
        showToast('Ride Rejected', ToastStatus.SUCCESS);
        onSuccess?.();
      } catch (error) {
        console.error('Failed to reject ride:', error);
        showToast('Failed to reject ride', ToastStatus.ERROR);
      }
      return;
    }

    // All other cases: call DELETE endpoint
    // Backend will handle:
    //   - If unscheduled ride + user is rider: physically delete the ride
    //   - If scheduled ride (has driver) + user is admin: set status to CANCELLED
    try {
      await axios.delete(`/api/rides/${ride.id}`);

      // Close the cancel confirmation modal
      onClose();

      // Refresh the rides data
      refreshRides();

      // Show success message
      showToast('Ride Cancelled', ToastStatus.SUCCESS);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to cancel ride:', error);
      showToast('Failed to cancel ride', ToastStatus.ERROR);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {!ride.driver && userRole === 'admin' ? 'Reject Ride' : 'Cancel Ride'}
      </DialogTitle>
      <DialogContent>
        <Typography>
          {!ride.driver && userRole === 'admin'
            ? 'Are you sure you want to reject this ride? This will mark the ride as rejected and notify the rider.'
            : 'Are you sure you want to cancel this ride? This action cannot be undone.'}
        </Typography>
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Ride Summary
          </Typography>
          <Typography variant="body2">
            {new Date(ride.startTime).toLocaleDateString()} at{' '}
            {new Date(ride.startTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
          {ride.riders && ride.riders.length > 0 && (
            <Typography variant="body2">
              Rider:{' '}
              {ride.riders
                .map((rider) => rider.firstName + ' ' + rider.lastName)
                .join(', ')}
            </Typography>
          )}
          {ride.driver && (
            <Typography variant="body2">
              Driver: {ride.driver?.firstName + ' ' + ride.driver?.lastName}
            </Typography>
          )}
          <Typography variant="body2">
            From: {ride.startLocation.name}
          </Typography>
          <Typography variant="body2">To: {ride.endLocation.name}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Keep Ride</Button>
        <Button onClick={handleCancelConfirm} variant="contained" color="error">
          {!ride.driver && userRole === 'admin' ? 'Reject Ride' : 'Cancel Ride'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelRideConfirmationDialog;
