import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import UpdateIcon from '@mui/icons-material/Update';
import ReportIcon from '@mui/icons-material/Report';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloseIcon from '@mui/icons-material/Close';
import { Status } from '../../types';
import { useRideEdit } from './RideEditContext';
import {
  canUpdateStatus,
  canCancelRide,
  getRestrictionMessage,
  UserRole,
} from '../../util/rideValidation';
import { useToast, ToastStatus } from '../../context/toastContext';
import { useRides } from '../../context/RidesContext';
import { useDate } from '../../context/date';
import { isNewRide } from '../../util/modelFixtures';
import axios from '../../util/axios';
import UpdateStatusModal from '../UpdateStatusModal/UpdateStatusModal';

interface RideActionsProps {
  userRole: UserRole;
  isMobile?: boolean;
  onClose?: () => void;
}

const RideActions: React.FC<RideActionsProps> = ({
  userRole,
  isMobile = false,
  onClose,
}) => {
  const {
    isEditing,
    editedRide,
    canEdit,
    hasChanges,
    startEditing,
    stopEditing,
    saveChanges,
  } = useRideEdit();
  const { showToast } = useToast();
  const { refreshRides, updateRideStatus } = useRides();
  const { curDate } = useDate();

  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [contactAdminOpen, setContactAdminOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [saving, setSaving] = useState(false);

  const ride = editedRide!; // We know this exists from the context
  const rideCompleted = ride.status === Status.COMPLETED;
  const canUpdateRideStatus = canUpdateStatus(ride, userRole);
  const canCancelThisRide = canCancelRide(ride, userRole);

  const handleStatusUpdate = async (newStatus: Status) => {
    // Extra guard even though the UI should prevent this
    if (!canUpdateRideStatus) return;

    setUpdating(true);
    try {
      await updateRideStatus(ride.id, newStatus);
      showToast('Ride status updated', ToastStatus.SUCCESS);

      // Ensure any date-based ride views stay in sync with the latest status
      await refreshRides();
    } catch (error) {
      console.error('Failed to update status:', error);
      showToast('Failed to update ride status', ToastStatus.ERROR);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setCancelConfirmOpen(true);
  };

  const handleCancelConfirm = async () => {
    // Check for recurring rides (not supported yet)
    if (ride.isRecurring) {
      showToast('Recurring ride deletion not supported yet', ToastStatus.ERROR);
      return;
    }

    try {
      // Call the DELETE endpoint like DeleteOrEditTypeModal does
      await axios.delete(`/api/rides/${ride.id}`);

      // Close the cancel confirmation modal
      setCancelConfirmOpen(false);

      // Close the main ride details dialog since the ride no longer exists
      if (onClose) {
        onClose();
      }

      // Refresh the rides data
      refreshRides();

      // Show success message
      showToast('Ride Cancelled', ToastStatus.SUCCESS);
    } catch (error) {
      console.error('Failed to cancel ride:', error);
      showToast('Failed to cancel ride', ToastStatus.ERROR);
    }
  };

  const handleEdit = () => {
    if (isEditing) {
      // Save changes
      handleSave();
    } else {
      // Start editing
      startEditing();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await saveChanges();
      if (success) {
        const message = isNewRide(ride)
          ? 'Ride created successfully'
          : 'Ride saved successfully';
        showToast(message, ToastStatus.SUCCESS);

        // Only refresh rides if the ride is on the current date being displayed in the context
        const rideDate = new Date(ride.startTime).toDateString();
        const contextDate = curDate.toDateString();
        if (rideDate === contextDate) {
          refreshRides();
        }

        if (isNewRide(ride) && onClose) {
          onClose(); // Close modal after creating new ride
        }
      } else {
        const message = isNewRide(ride)
          ? 'Failed to create ride'
          : 'Failed to save ride';
        showToast(message, ToastStatus.ERROR);
      }
    } catch (error) {
      console.error('Error saving ride:', error);
      const message = isNewRide(ride)
        ? 'Failed to create ride'
        : 'Failed to save ride';
      showToast(message, ToastStatus.ERROR);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    stopEditing();
  };

  const handleReport = () => {
    // In a real app, open report issue dialog
  };

  const allStatuses: Status[] = useMemo(() => {
    return Object.values(Status) as Status[];
  }, []);

  const renderRiderActions = () => {
    if (canEdit) {
      return (
        <Stack direction={isMobile ? 'column' : 'row'} spacing={1}>
          <Button
            variant="contained"
            startIcon={
              !isMobile ? isEditing ? <SaveIcon /> : <EditIcon /> : undefined
            }
            onClick={handleEdit}
            fullWidth={isMobile}
            disabled={rideCompleted || (isEditing && !hasChanges) || saving}
            aria-label={isEditing ? 'Save changes' : 'Edit ride'}
          >
            {isMobile ? (
              isEditing ? (
                <SaveIcon />
              ) : (
                <EditIcon />
              )
            ) : isEditing ? (
              isNewRide(ride) ? (
                'Create'
              ) : (
                'Save'
              )
            ) : (
              'Edit'
            )}
          </Button>
          {isEditing && (
            <Button
              variant="outlined"
              startIcon={!isMobile ? <CloseIcon /> : undefined}
              onClick={handleCancelEdit}
              fullWidth={isMobile}
              aria-label="Cancel editing"
            >
              {isMobile ? <CloseIcon /> : 'Cancel Edit'}
            </Button>
          )}
          {!isEditing && (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={!isMobile ? <CancelIcon /> : undefined}
                onClick={handleCancel}
                fullWidth={isMobile}
                disabled={!canCancelThisRide}
                aria-label="Cancel ride"
                title={
                  !canCancelThisRide
                    ? getRestrictionMessage(ride, 'cancel', userRole)
                    : undefined
                }
              >
                {isMobile ? <CancelIcon /> : 'Cancel Ride'}
              </Button>
              <Button
                variant="outlined"
                startIcon={!isMobile ? <ReportIcon /> : undefined}
                onClick={handleReport}
                fullWidth={isMobile}
                aria-label="Report issue"
              >
                {isMobile ? <ReportIcon /> : 'Report'}
              </Button>
            </>
          )}
        </Stack>
      );
    } else {
      return (
        <Stack direction={isMobile ? 'column' : 'row'} spacing={1}>
          <Button
            variant="contained"
            startIcon={!isMobile ? <AdminPanelSettingsIcon /> : undefined}
            onClick={() => setContactAdminOpen(true)}
            fullWidth={isMobile}
            aria-label="Contact Admin"
          >
            {isMobile ? <AdminPanelSettingsIcon /> : 'Contact Admin'}
          </Button>
          <Button
            variant="outlined"
            startIcon={!isMobile ? <ReportIcon /> : undefined}
            onClick={handleReport}
            fullWidth={isMobile}
            aria-label="Report issue"
          >
            {isMobile ? <ReportIcon /> : 'Report'}
          </Button>
        </Stack>
      );
    }
  };

  const renderDriverActions = () => (
    <Stack direction={isMobile ? 'column' : 'row'} spacing={1}>
      <Button
        variant="contained"
        startIcon={!isMobile ? <UpdateIcon /> : undefined}
        onClick={() => setUpdateStatusOpen(true)}
        fullWidth={isMobile}
        disabled={!canUpdateRideStatus}
        aria-label="Update Status"
        title={
          !canUpdateRideStatus
            ? getRestrictionMessage(ride, 'updateStatus', userRole)
            : undefined
        }
      >
        {isMobile ? <UpdateIcon /> : 'Update Status'}
      </Button>
      <Button
        variant="outlined"
        startIcon={!isMobile ? <ReportIcon /> : undefined}
        onClick={handleReport}
        fullWidth={isMobile}
        aria-label="Report issue"
      >
        {isMobile ? <ReportIcon /> : 'Report'}
      </Button>
    </Stack>
  );

  const renderAdminActions = () => (
    <Stack direction={isMobile ? 'column' : 'row'} spacing={1}>
      <Button
        variant="contained"
        startIcon={
          !isMobile ? isEditing ? <SaveIcon /> : <EditIcon /> : undefined
        }
        onClick={handleEdit}
        fullWidth={isMobile}
        disabled={(isEditing && !hasChanges) || saving}
        aria-label={isEditing ? 'Save changes' : 'Edit ride'}
      >
        {isMobile ? (
          isEditing ? (
            <SaveIcon />
          ) : (
            <EditIcon />
          )
        ) : isEditing ? (
          isNewRide(ride) ? (
            'Create'
          ) : (
            'Save'
          )
        ) : (
          'Edit'
        )}
      </Button>
      {isEditing && (
        <Button
          variant="outlined"
          startIcon={!isMobile ? <CloseIcon /> : undefined}
          onClick={handleCancelEdit}
          fullWidth={isMobile}
          aria-label="Cancel editing"
        >
          {isMobile ? <CloseIcon /> : 'Cancel Edit'}
        </Button>
      )}
      {!isEditing && (
        <>
          <Button
            variant="outlined"
            color="error"
            startIcon={!isMobile ? <CancelIcon /> : undefined}
            onClick={() => setCancelConfirmOpen(true)}
            fullWidth={isMobile}
            disabled={!canCancelThisRide}
            aria-label="Cancel ride"
            title={
              !canCancelThisRide
                ? getRestrictionMessage(ride, 'cancel', userRole)
                : undefined
            }
          >
            {isMobile ? <CancelIcon /> : 'Cancel Ride'}
          </Button>
        </>
      )}
    </Stack>
  );

  const getActionsForRole = () => {
    switch (userRole) {
      case 'rider':
        return renderRiderActions();
      case 'driver':
        return renderDriverActions();
      case 'admin':
        return renderAdminActions();
      default:
        return null;
    }
  };

  const nextStatuses = allStatuses // instead of preset transitions, give driver more options

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>{getActionsForRole()}</Box>
      {onClose && (
        <Box sx={{ ml: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CloseIcon />}
            onClick={onClose}
            aria-label="Close"
          >
            Close
          </Button>
        </Box>
      )}

      {/* Update Status Modal */}
      {canUpdateRideStatus && (
        <UpdateStatusModal
          open={updateStatusOpen}
          onClose={() => setUpdateStatusOpen(false)}
          currentStatus={ride.status}
          nextStatuses={nextStatuses}
          onUpdate={async (newStatus) => {
            await handleStatusUpdate(newStatus);
            setUpdateStatusOpen(false);
          }}
          updating={updating}
        />
      )}

      {/* Cancel Confirmation Modal */}
      <Dialog
        open={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Cancel Ride</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this ride? This action cannot be
            undone.
          </Typography>
          <Box
            sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}
          >
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
            <Typography variant="body2">
              From: {ride.startLocation.name}
            </Typography>
            <Typography variant="body2">To: {ride.endLocation.name}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelConfirmOpen(false)}>Keep Ride</Button>
          <Button
            onClick={handleCancelConfirm}
            variant="contained"
            color="error"
          >
            Cancel Ride
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Admin Modal */}
      <Dialog
        open={contactAdminOpen}
        onClose={() => setContactAdminOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Contact Admin</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Need help with your ride? Contact our admin team using the
            information below.
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <PhoneIcon />
              </ListItemIcon>
              <ListItemText primary="Phone" secondary="(555) 123-4567" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText primary="Email" secondary="admin@carriage.com" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactAdminOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RideActions;
