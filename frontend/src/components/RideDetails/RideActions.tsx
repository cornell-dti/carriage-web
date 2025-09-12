import React, { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
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
import { RideType, Status, SchedulingState } from '../../types';
import { useRideEdit } from './RideEditContext';

interface RideActionsProps {
  userRole: 'rider' | 'driver' | 'admin';
  isMobile?: boolean;
  onClose?: () => void;
}

// Define status transitions
const getNextStatuses = (currentStatus: Status): Status[] => {
  switch (currentStatus) {
    case Status.NOT_STARTED:
      return [Status.ON_THE_WAY, Status.CANCELLED, Status.NO_SHOW];
    case Status.ON_THE_WAY:
      return [Status.ARRIVED, Status.CANCELLED, Status.NO_SHOW];
    case Status.ARRIVED:
      return [Status.PICKED_UP, Status.CANCELLED, Status.NO_SHOW];
    case Status.PICKED_UP:
      return [Status.COMPLETED, Status.CANCELLED];
    default:
      return [];
  }
};

const formatStatusLabel = (status: Status): string => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const RideActions: React.FC<RideActionsProps> = ({ userRole, isMobile = false, onClose }) => {
  const { 
    isEditing, 
    editedRide, 
    canEdit, 
    hasChanges, 
    startEditing, 
    stopEditing, 
    saveChanges 
  } = useRideEdit();
  
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [contactAdminOpen, setContactAdminOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [updating, setUpdating] = useState(false);
  const [saving, setSaving] = useState(false);

  const ride = editedRide!; // We know this exists from the context
  const rideCompleted = ride.status === Status.COMPLETED;

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    
    setUpdating(true);
    try {
      // In a real app, make API call to update status
      console.log('Updating status to:', selectedStatus);
      // await updateRideStatus(ride.id, selectedStatus);
      setUpdateStatusOpen(false);
      setSelectedStatus(null);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    try {
      // In a real app, make API call to cancel ride
      console.log('Cancelling ride:', ride.id);
      // await cancelRide(ride.id);
      setCancelConfirmOpen(false);
    } catch (error) {
      console.error('Failed to cancel ride:', error);
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
      if (!success) {
        // Handle save failure
        console.error('Failed to save ride changes');
      }
    } catch (error) {
      console.error('Error saving ride:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    stopEditing();
  };

  const handleReport = () => {
    // In a real app, open report issue dialog
    console.log('Report issue for ride:', ride.id);
  };

  const renderRiderActions = () => {
    if (canEdit) {
      return (
        <Stack direction={isMobile ? "column" : "row"} spacing={1}>
          <Button
            variant="contained"
            startIcon={!isMobile ? (isEditing ? <SaveIcon /> : <EditIcon />) : undefined}
            onClick={handleEdit}
            fullWidth={isMobile}
            disabled={rideCompleted || (isEditing && !hasChanges) || saving}
            aria-label={isEditing ? "Save changes" : "Edit ride"}
          >
            {isMobile ? (isEditing ? <SaveIcon /> : <EditIcon />) : (isEditing ? 'Save' : 'Edit')}
          </Button>
          {isEditing && (
            <Button
              variant="outlined"
              startIcon={!isMobile ? <CancelIcon /> : undefined}
              onClick={handleCancelEdit}
              fullWidth={isMobile}
              aria-label="Cancel editing"
            >
              {isMobile ? <CancelIcon /> : 'Cancel'}
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
                disabled={rideCompleted}
                aria-label="Cancel ride"
              >
                {isMobile ? <CancelIcon /> : 'Cancel'}
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
        <Stack direction={isMobile ? "column" : "row"} spacing={1}>
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
    <Stack direction={isMobile ? "column" : "row"} spacing={1}>
      <Button
        variant="contained"
        startIcon={!isMobile ? <UpdateIcon /> : undefined}
        onClick={() => setUpdateStatusOpen(true)}
        fullWidth={isMobile}
        disabled={rideCompleted}
        aria-label="Update Status"
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
    <Stack direction={isMobile ? "column" : "row"} spacing={1}>
      <Button
        variant="contained"
        startIcon={!isMobile ? (isEditing ? <SaveIcon /> : <EditIcon />) : undefined}
        onClick={handleEdit}
        fullWidth={isMobile}
        disabled={(isEditing && !hasChanges) || saving}
        aria-label={isEditing ? "Save changes" : "Edit ride"}
      >
        {isMobile ? (isEditing ? <SaveIcon /> : <EditIcon />) : (isEditing ? 'Save' : 'Edit')}
      </Button>
      {isEditing && (
        <Button
          variant="outlined"
          startIcon={!isMobile ? <CancelIcon /> : undefined}
          onClick={handleCancelEdit}
          fullWidth={isMobile}
          aria-label="Cancel editing"
        >
          {isMobile ? <CancelIcon /> : 'Cancel'}
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
            aria-label="Cancel ride"
          >
            {isMobile ? <CancelIcon /> : 'Cancel'}
          </Button>
          <Button
            variant="outlined"
            startIcon={!isMobile ? <AdminPanelSettingsIcon /> : undefined}
            onClick={handleReport}
            fullWidth={isMobile}
            disabled
            aria-label="Actions (placeholder)"
          >
            {isMobile ? <AdminPanelSettingsIcon /> : 'Actions'}
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

  const nextStatuses = getNextStatuses(ride.status);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {getActionsForRole()}
      </Box>
      {onClose && (
        <Button
          variant="outlined"
          startIcon={<CloseIcon />}
          onClick={onClose}
          aria-label="Close"
        >
          Close
        </Button>
      )}

      {/* Update Status Modal */}
      <Dialog open={updateStatusOpen} onClose={() => setUpdateStatusOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Update Ride Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Current status: {formatStatusLabel(ride.status)}
          </Typography>
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend">Select new status</FormLabel>
            <RadioGroup
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value as Status)}
            >
              {nextStatuses.map((status) => (
                <FormControlLabel
                  key={status}
                  value={status}
                  control={<Radio />}
                  label={formatStatusLabel(status)}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateStatusOpen(false)}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={!selectedStatus || updating}
            startIcon={updating ? <CircularProgress size={20} /> : undefined}
          >
            {updating ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Modal */}
      <Dialog open={cancelConfirmOpen} onClose={() => setCancelConfirmOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Cancel Ride</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this ride? This action cannot be undone.
          </Typography>
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Ride Summary
            </Typography>
            <Typography variant="body2">
              {new Date(ride.startTime).toLocaleDateString()} at{' '}
              {new Date(ride.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
            <Typography variant="body2">
              From: {ride.startLocation.name}
            </Typography>
            <Typography variant="body2">
              To: {ride.endLocation.name}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelConfirmOpen(false)}>Keep Ride</Button>
          <Button onClick={handleCancel} variant="contained" color="error">
            Cancel Ride
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Admin Modal */}
      <Dialog open={contactAdminOpen} onClose={() => setContactAdminOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Contact Admin</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Need help with your ride? Contact our admin team using the information below.
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <PhoneIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Phone" 
                secondary="(555) 123-4567"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Email" 
                secondary="admin@carriage.com"
              />
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