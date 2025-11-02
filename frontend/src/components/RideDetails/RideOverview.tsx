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
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import RepeatIcon from '@mui/icons-material/Repeat';
import {
  RideType,
  Status,
  SchedulingState,
  Type,
  Driver,
  Rider,
} from '../../types';
import { useRideEdit } from './RideEditContext';
import RecurrenceDisplay from './RecurrenceDisplay';
import RiderList from './RiderList';
import { isNewRide } from '../../util/modelFixtures';
import styles from './RideOverview.module.css';
import { useToast, ToastStatus } from '../../context/toastContext';
import { useErrorModal, formatErrorMessage } from '../../context/errorModal';

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

const getStatusColor = (
  status: Status
): 'default' | 'primary' | 'info' | 'warning' | 'success' | 'error' => {
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

const getSchedulingStateColor = (
  state: SchedulingState
): 'default' | 'success' | 'warning' => {
  switch (state) {
    case SchedulingState.SCHEDULED:
      return 'success';
    case SchedulingState.UNSCHEDULED:
      return 'warning';
    default:
      return 'default';
  }
};

const getTemporalTypeColor = (
  type: string
): 'default' | 'info' | 'warning' | 'success' => {
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
const PersonCardOverview: React.FC<{
  person: Driver | Rider;
  type: 'driver' | 'rider';
  showAccessibility?: boolean;
}> = ({ person, type, showAccessibility = false }) => {
  const isRider = type === 'rider';
  const rider = isRider ? (person as Rider) : undefined;

  return (
    <div className={styles.personCard}>
      <CardContent sx={{ p: 2 }}>
        <div className={styles.personHeader}>
          <Avatar src={person.photoLink} sx={{ width: 48, height: 48 }}>
            {person.firstName?.charAt(0)}
            {person.lastName?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, ml: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
              {person.firstName} {person.lastName}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ textTransform: 'capitalize' }}
            >
              {type}
            </Typography>
          </Box>
        </div>

        {/* Contact Information */}
        <div className={styles.contactInfo}>
          {person.phoneNumber && (
            <div className={styles.contactRow}>
              <PhoneIcon fontSize="small" color="action" />
              <Typography variant="body2">{person.phoneNumber}</Typography>
            </div>
          )}
          {person.email && (
            <div className={styles.contactRow}>
              <EmailIcon fontSize="small" color="action" />
              <Typography variant="body2">{person.email}</Typography>
            </div>
          )}
        </div>

        {/* Accessibility needs for riders */}
        {showAccessibility &&
          rider?.accessibility &&
          rider.accessibility.length > 0 && (
            <div className={styles.accessibilitySection}>
              <Typography
                variant="body2"
                color="textSecondary"
                gutterBottom
                sx={{ fontSize: '0.85rem' }}
              >
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
  const {
    editedRide,
    isEditing,
    updateRideField,
    userRole: contextUserRole,
  } = useRideEdit();
  const ride = editedRide!;
  const temporalType = getTemporalType(ride);
  const showRecurrence = userRole !== 'driver'; // Hide recurrence for drivers
  const { showToast } = useToast();
  const { showError } = useErrorModal();
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
  const handleStartDateChange = (newDate: Dayjs | null) => {
    if (!newDate) return;

    const currentStartTime = dayjs(ride.startTime);
    const updatedStartTime = newDate
      .hour(currentStartTime.hour())
      .minute(currentStartTime.minute())
      .second(0)
      .millisecond(0);

    const currentEndTime = dayjs(ride.endTime);

    // Ensure end time is after start time
    try {
      if (
        updatedStartTime.isAfter(currentEndTime) ||
        updatedStartTime.isSame(currentEndTime)
      ) {
        const newEndTime = updatedStartTime.add(30, 'minute');
        updateRideField('endTime', newEndTime.toISOString());
      }

      updateRideField('startTime', updatedStartTime.toISOString());
    } catch (error) {
      console.error('Failed to update ride time:', error);
      showError(`Error updating ride time: ${formatErrorMessage(error)}`, 'Ride Edit Error');
    }
  };

  const handleStartTimeChange = (newTime: Dayjs | null) => {
    if (!newTime) return;

    const currentStartDate = dayjs(ride.startTime);
    const updatedStartTime = currentStartDate
      .hour(newTime.hour())
      .minute(newTime.minute())
      .second(0)
      .millisecond(0);

    const currentEndTime = dayjs(ride.endTime);

    // Ensure end time is after start time
    if (
      updatedStartTime.isAfter(currentEndTime) ||
      updatedStartTime.isSame(currentEndTime)
    ) {
      const newEndTime = updatedStartTime.add(30, 'minute');
      updateRideField('endTime', newEndTime.toISOString());
    }

    updateRideField('startTime', updatedStartTime.toISOString());
  };

  const handleEndDateChange = (newDate: Dayjs | null) => {
    if (!newDate) return;

    const currentEndTime = dayjs(ride.endTime);
    const updatedEndTime = newDate
      .hour(currentEndTime.hour())
      .minute(currentEndTime.minute())
      .second(0)
      .millisecond(0);

    updateRideField('endTime', updatedEndTime.toISOString());
  };

  const handleEndTimeChange = (newTime: Dayjs | null) => {
    if (!newTime) return;

    const currentEndDate = dayjs(ride.endTime);
    const updatedEndTime = currentEndDate
      .hour(newTime.hour())
      .minute(newTime.minute())
      .second(0)
      .millisecond(0);

    updateRideField('endTime', updatedEndTime.toISOString());
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
    if (userRole === 'admin') return null; // Admin overview shows only ride info, people are in separate tab

    if (userRole === 'rider') {
      return (
        <div className={styles.rightColumn}>
          <div className={styles.sectionTitle}>
            <PersonIcon color="primary" />
            <Typography variant="h6">Driver</Typography>
          </div>
          <div className={styles.contentArea}>
            <div className={styles.riderListContainer}>
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
          </div>
        </div>
      );
    }

    if (userRole === 'driver') {
      return (
        <div className={styles.rightColumn}>
          <div className={styles.sectionTitle}>
            <PersonIcon color="primary" />
            <Typography variant="h6">
              Riders ({ride.riders?.length || 0})
            </Typography>
          </div>
          <div className={styles.contentArea}>
            <div className={styles.riderListContainer}>
              <RiderList
                riders={ride.riders || []}
                showAccessibility
                hideHeader
              />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.container}>
      <div
        className={
          userRole === 'admin' ? styles.adminOverviewGrid : styles.overviewGrid
        }
      >
        {/* Left Column - Ride Information */}
        <div className={styles.leftColumn}>
          <div className={styles.sectionTitle}>
            <DirectionsCarIcon color="primary" />
            <Typography variant="h6">Ride Overview</Typography>
          </div>
          <div className={styles.contentArea}>
            {/* Schedule Section */}
            <div className={styles.scheduleSection}>
              {isEditing ? (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <div className={styles.editFormFields}>
                    {(() => {
                      // For editing existing rides, allow past times; for new rides, don't
                      const allowPastTimes = !isNewRide(ride);

                      // Inline date/time validation removed; handled on Save
                      const hasStartTimeError = false;
                      const hasEndTimeError = false;

                      return (
                        <>
                          <div className={styles.dateTimeRow}>
                            <div style={{ flex: 1 }}>
                              <DatePicker
                                label="Start Date"
                                value={dayjs(ride.startTime)}
                                onChange={handleStartDateChange}
                                slotProps={{
                                  textField: {
                                    size: 'small',
                                    fullWidth: true,
                                    error: hasStartTimeError,
                                    helperText: hasStartTimeError
                                      ? ' '
                                      : undefined,
                                  },
                                }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <TimePicker
                                label="Start Time"
                                value={dayjs(ride.startTime)}
                                onChange={handleStartTimeChange}
                                slotProps={{
                                  textField: {
                                    size: 'small',
                                    fullWidth: true,
                                    error: hasStartTimeError,
                                    helperText: hasStartTimeError
                                      ? ' '
                                      : undefined,
                                  },
                                }}
                              />
                              {/* Start time specific error - directly below start time field */}
                              {/* Field-level error messaging removed; errors surface on Save */}
                            </div>
                          </div>

                          <div className={styles.dateTimeRow}>
                            <div style={{ flex: 1 }}>
                              <DatePicker
                                label="End Date"
                                value={dayjs(ride.endTime)}
                                onChange={handleEndDateChange}
                                slotProps={{
                                  textField: {
                                    size: 'small',
                                    fullWidth: true,
                                    error: hasEndTimeError,
                                    helperText: hasEndTimeError
                                      ? ' '
                                      : undefined,
                                  },
                                }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <TimePicker
                                label="End Time"
                                value={dayjs(ride.endTime)}
                                onChange={handleEndTimeChange}
                                slotProps={{
                                  textField: {
                                    size: 'small',
                                    fullWidth: true,
                                    error: hasEndTimeError,
                                    helperText: hasEndTimeError
                                      ? ' '
                                      : undefined,
                                  },
                                }}
                              />
                              {/* End time specific errors - directly below end time field */}
                              {/* Field-level error messaging removed; errors surface on Save */}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </LocalizationProvider>
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
                        <Typography variant="body2" color="textSecondary">
                          Start
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {startDateTime.time}
                        </Typography>
                      </Box>
                    </div>
                    <div className={styles.timeBlock}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          End
                        </Typography>
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

              {isEditing && userRole === 'admin' && !isNewRide(ride) ? (
                <div className={styles.editStatusFields}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={ride.status}
                      onChange={handleStatusChange}
                      label="Status"
                    >
                      {Object.values(Status).map((status) => (
                        <MenuItem key={status} value={status}>
                          {status
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
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
                  <FormControl size="small" sx={{ minWidth: 120 }}>
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
                </div>
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
            {showRecurrence && (
              <div className={styles.recurrenceSection}>
                <div className={styles.sectionTitle}>
                  <RepeatIcon color="primary" />
                  <Typography variant="h6">Recurrence</Typography>
                </div>

                {isEditing ? (
                  <div className={styles.editRecurrenceFields}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Repeat</InputLabel>
                      <Select
                        value={ride.isRecurring ? 'weekly' : 'none'}
                        onChange={(e) =>
                          updateRideField(
                            'isRecurring',
                            e.target.value !== 'none'
                          )
                        }
                        label="Repeat"
                      >
                        <MenuItem value="none">Does not repeat</MenuItem>
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="custom">Custom</MenuItem>
                      </Select>
                    </FormControl>

                    {ride.isRecurring && (
                      <>
                        <TextField
                          label="End date (optional)"
                          type="date"
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          placeholder="No end date"
                        />
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ fontStyle: 'italic' }}
                        >
                          Note: Full recurrence functionality coming soon
                        </Typography>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <RecurrenceDisplay
                      ride={ride}
                      showForRole={showRecurrence}
                    />
                    {!ride.isRecurring && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 2,
                          backgroundColor: 'grey.50',
                          borderRadius: 1,
                          border: '1px dashed',
                          borderColor: 'grey.300',
                        }}
                      >
                        <RepeatIcon color="disabled" />
                        <Typography variant="body2" color="textSecondary">
                          This ride does not repeat
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Person Information */}
        {renderPersonSection()}
      </div>
    </div>
  );
};

export default RideOverview;
