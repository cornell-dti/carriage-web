import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { RideType, Status, SchedulingState, Type, Driver, Rider } from '../../types';
import { useRideEdit } from './RideEditContext';
import RecurrenceDisplay from './RecurrenceDisplay';
import styles from './RideOverview.module.css';

interface RideOverviewProps {
  userRole: 'rider' | 'driver' | 'admin';
}

// Helper function to determine temporal type
const getTemporalType = (ride: RideType): 'Past' | 'Active' | 'Upcoming' => {
  const now = new Date().getTime();
  const startTime = new Date(ride.startTime).getTime();
  const endTime = new Date(ride.endTime).getTime();

  if (endTime < now) return 'Past';
  if (startTime <= now && now < endTime) return 'Active';
  return 'Upcoming';
};

// Helper function to format recurrence summary
const getRecurrenceSummary = (ride: RideType): string => {
  if (!ride.isRecurring || !ride.rrule) return '';
  
  // Basic RRULE parsing - in practice you might use a library like rrule
  if (ride.rrule.includes('FREQ=DAILY')) return 'Daily';
  if (ride.rrule.includes('FREQ=WEEKLY')) return 'Weekly';
  if (ride.rrule.includes('FREQ=MONTHLY')) return 'Monthly';
  return 'Custom recurrence';
};

const getStatusColor = (status: Status): 'default' | 'primary' | 'info' | 'warning' | 'success' | 'error' => {
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

const getSchedulingStateColor = (state: SchedulingState): 'default' | 'success' | 'warning' => {
  switch (state) {
    case SchedulingState.SCHEDULED:
      return 'success';
    case SchedulingState.UNSCHEDULED:
      return 'warning';
    default:
      return 'default';
  }
};

const getTemporalTypeColor = (type: string): 'default' | 'info' | 'warning' | 'success' => {
  switch (type) {
    case 'Past':
      return 'default';
    case 'Active':
      return 'warning';
    case 'Upcoming':
      return 'info';
    default:
      return 'default';
  }
};

// Person card component for the overview
const PersonCardOverview: React.FC<{ person: Driver | Rider; type: 'driver' | 'rider'; showAccessibility?: boolean }> = ({ 
  person, 
  type, 
  showAccessibility = false 
}) => {
  const isRider = type === 'rider';
  const rider = isRider ? person as Rider : undefined;

  return (
    <div className={styles.personCard}>
      <CardContent sx={{ p: 2 }}>
        <div className={styles.personHeader}>
          <Avatar
            src={person.photoLink}
            sx={{ width: 48, height: 48 }}
          >
            {person.firstName?.charAt(0)}{person.lastName?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, ml: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
              {person.firstName} {person.lastName}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
              {type}
            </Typography>
            {rider?.pronouns && (
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
                {rider.pronouns}
              </Typography>
            )}
          </Box>
        </div>

        {/* Contact Information */}
        <div className={styles.contactInfo}>
          {person.phoneNumber && (
            <div className={styles.contactRow}>
              <PhoneIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {person.phoneNumber}
              </Typography>
            </div>
          )}
          {person.email && (
            <div className={styles.contactRow}>
              <EmailIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {person.email}
              </Typography>
            </div>
          )}
        </div>

        {/* Accessibility needs for riders */}
        {showAccessibility && rider?.accessibility && rider.accessibility.length > 0 && (
          <div className={styles.accessibilitySection}>
            <Typography variant="body2" color="textSecondary" gutterBottom sx={{ fontSize: '0.85rem' }}>
              Accessibility Needs
            </Typography>
            <div className={styles.accessibilityChips}>
              {rider.accessibility.map((need: string) => (
                <Chip
                  key={need}
                  label={need}
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', height: 24 }}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
};

const RideOverview: React.FC<RideOverviewProps> = ({ userRole }) => {
  const { editedRide, isEditing, updateRideField, userRole: contextUserRole } = useRideEdit();
  const ride = editedRide!;
  const temporalType = getTemporalType(ride);
  const showRecurrence = userRole !== 'driver'; // Hide recurrence for drivers

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    };
  };

  const startDateTime = formatDateTime(ride.startTime);
  const endDateTime = formatDateTime(ride.endTime);

  // Helper functions for date/time editing
  const handleStartTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = new Date(event.target.value);
    const currentEndTime = new Date(ride.endTime);
    
    // Ensure end time is after start time
    if (newStartTime >= currentEndTime) {
      const newEndTime = new Date(newStartTime.getTime() + 30 * 60000); // Add 30 minutes
      updateRideField('endTime', newEndTime.toISOString());
    }
    
    updateRideField('startTime', newStartTime.toISOString());
  };

  const handleEndTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = new Date(event.target.value);
    updateRideField('endTime', newEndTime.toISOString());
  };

  const handleStatusChange = (event: any) => {
    updateRideField('status', event.target.value);
  };

  const handleSchedulingStateChange = (event: any) => {
    updateRideField('schedulingState', event.target.value);
  };

  const handleTypeChange = (event: any) => {
    updateRideField('type', event.target.value);
  };

  const renderPersonSection = () => {
    if (userRole === 'admin') return null; // Admin has separate People tab
    
    if (userRole === 'rider') {
      return (
        <div className={styles.rightColumn}>
          <div className={styles.sectionTitle}>
            <PersonIcon color="primary" />
            <Typography variant="h6">Driver</Typography>
          </div>
          {ride.driver ? (
            <PersonCardOverview person={ride.driver} type="driver" />
          ) : (
            <div className={styles.notAssigned}>
              <Typography variant="body1" color="textSecondary">
                Not assigned
              </Typography>
            </div>
          )}
        </div>
      );
    }
    
    if (userRole === 'driver') {
      return (
        <div className={styles.rightColumn}>
          <div className={styles.sectionTitle}>
            <PersonIcon color="primary" />
            <Typography variant="h6">Rider</Typography>
          </div>
          <PersonCardOverview person={ride.rider} type="rider" showAccessibility />
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.overviewGrid}>
        {/* Left Column - Ride Information */}
        <div className={styles.leftColumn}>
          <div className={styles.sectionTitle}>
            <DirectionsCarIcon color="primary" />
            <Typography variant="h6">Ride Overview</Typography>
          </div>
          
          {/* Schedule Section */}
          <div className={styles.scheduleSection}>
            {isEditing ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Start Date & Time"
                    type="datetime-local"
                    value={new Date(ride.startTime).toISOString().slice(0, 16)}
                    onChange={handleStartTimeChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="End Date & Time"
                    type="datetime-local"
                    value={new Date(ride.endTime).toISOString().slice(0, 16)}
                    onChange={handleEndTimeChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            ) : (
              <>
                <div className={styles.dateRow}>
                  <CalendarTodayIcon fontSize="small" color="action" />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {startDateTime.date}
                  </Typography>
                </div>
                
                <div className={styles.timeRow}>
                  <div className={styles.timeBlock}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2" color="textSecondary">Start</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {startDateTime.time}
                      </Typography>
                    </Box>
                  </div>
                  <div className={styles.timeBlock}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2" color="textSecondary">End</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {endDateTime.time}
                      </Typography>
                    </Box>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Status Section */}
          <div className={styles.statusSection}>
            <div className={styles.statusHeader}>
              <InfoIcon color="primary" />
              <Typography variant="h6">Status</Typography>
            </div>
            
            {isEditing && userRole === 'admin' ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={ride.status}
                      onChange={handleStatusChange}
                      label="Status"
                    >
                      {Object.values(Status).map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Scheduling State</InputLabel>
                    <Select
                      value={ride.schedulingState}
                      onChange={handleSchedulingStateChange}
                      label="Scheduling State"
                    >
                      {Object.values(SchedulingState).map((state) => (
                        <MenuItem key={state} value={state}>
                          {state.charAt(0).toUpperCase() + state.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={ride.type}
                      onChange={handleTypeChange}
                      label="Type"
                    >
                      {Object.values(Type).map((type) => (
                        <MenuItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            ) : (
              <div className={styles.chipsContainer}>
                <Chip
                  label={ride.status.replace(/_/g, ' ')}
                  color={getStatusColor(ride.status)}
                  size="medium"
                />
                
                {/* Show scheduling state for rider and admin, hide for driver */}
                {userRole !== 'driver' && (
                  <Chip
                    label={ride.schedulingState}
                    color={getSchedulingStateColor(ride.schedulingState)}
                    size="medium"
                    variant="outlined"
                  />
                )}
                
                <Chip
                  label={temporalType}
                  color={getTemporalTypeColor(temporalType)}
                  size="medium"
                  variant="outlined"
                />
              </div>
            )}
          </div>

          {/* Recurrence Section - Show for Rider and Admin only */}
          <RecurrenceDisplay ride={ride} showForRole={showRecurrence} />
        </div>

        {/* Right Column - Person Information */}
        {renderPersonSection()}
      </div>
    </div>
  );
};

export default RideOverview;