import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { RideType, Driver, Rider } from '../../types';
import { useRideEdit } from './RideEditContext';
import { canChangeRider, canAssignDriver } from '../../util/rideValidation';
import axios from '../../util/axios';
import styles from './RidePeople.module.css';

interface RidePeopleProps {
  userRole: 'rider' | 'driver' | 'admin';
}

interface PersonCardProps {
  person: Driver | Rider;
  type: 'driver' | 'rider';
  showAccessibility?: boolean;
}

const PersonCard: React.FC<PersonCardProps> = ({ person, type, showAccessibility = false }) => {
  const isRider = type === 'rider';
  const rider = isRider ? person as Rider : undefined;

  return (
    <div className={styles.personCard}>
      <CardContent>
        <div className={styles.personHeader}>
          <Avatar
            src={person.photoLink}
            sx={{ width: 48, height: 48 }}
          >
            {person.firstName?.charAt(0)}{person.lastName?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {person.firstName} {person.lastName}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
              {type}
            </Typography>
            {rider?.pronouns && (
              <Typography variant="body2" color="textSecondary">
                {rider.pronouns}
              </Typography>
            )}
          </Box>
        </div>

        {/* Contact Information */}
        <div className={styles.contactInfo}>
          {person.phoneNumber && (
            <div className={styles.contactRow}>
              <IconButton size="small" aria-label="Call">
                <PhoneIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2">
                {person.phoneNumber}
              </Typography>
            </div>
          )}
          {person.email && (
            <div className={styles.contactRow}>
              <IconButton size="small" aria-label="Email">
                <EmailIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2">
                {person.email}
              </Typography>
            </div>
          )}
        </div>

        {/* Accessibility needs for riders */}
        {showAccessibility && rider?.accessibility && rider.accessibility.length > 0 && (
          <div className={styles.accessibilitySection}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
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
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
};

const RidePeople: React.FC<RidePeopleProps> = ({ userRole }) => {
  const { editedRide, isEditing, updateRideField } = useRideEdit();
  const ride = editedRide!;
  
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [driverSelectOpen, setDriverSelectOpen] = useState(false);
  const [driversError, setDriversError] = useState<string | null>(null);
  
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [riderSelectOpen, setRiderSelectOpen] = useState(false);
  const [ridersError, setRidersError] = useState<string | null>(null);

  // Fetch available drivers and riders when component mounts or when editing starts
  useEffect(() => {
    if (isEditing && userRole === 'admin') {
      fetchDrivers();
      fetchRiders();
    }
  }, [isEditing, userRole]);

  const fetchDrivers = async () => {
    setLoadingDrivers(true);
    setDriversError(null);
    try {
      const response = await axios.get('/api/drivers');
      // The API returns { data: [...] } structure
      const driversData = response.data?.data || response.data;
      // Ensure we have an array
      const driversArray = Array.isArray(driversData) ? driversData : [];
      setDrivers(driversArray);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      setDriversError('Failed to load drivers');
      setDrivers([]); // Ensure we have an empty array on error
    } finally {
      setLoadingDrivers(false);
    }
  };

  const fetchRiders = async () => {
    setLoadingRiders(true);
    setRidersError(null);
    try {
      const response = await axios.get('/api/riders');
      // The API returns { data: [...] } structure
      const ridersData = response.data?.data || response.data;
      // Ensure we have an array
      const ridersArray = Array.isArray(ridersData) ? ridersData : [];
      setRiders(ridersArray);
    } catch (error) {
      console.error('Failed to fetch riders:', error);
      setRidersError('Failed to load riders');
      setRiders([]); // Ensure we have an empty array on error
    } finally {
      setLoadingRiders(false);
    }
  };

  const handleDriverSelect = (driver: Driver | null) => {
    updateRideField('driver', driver);
    setDriverSelectOpen(false);
  };

  const handleRiderSelect = (rider: Rider) => {
    updateRideField('rider', rider);
    setRiderSelectOpen(false);
  };
  const renderRiderView = () => (
    <div className={styles.container}>
      <Typography variant="h6" gutterBottom>
        Driver Information
      </Typography>
      {ride.driver ? (
        <PersonCard person={ride.driver} type="driver" />
      ) : (
        <div className={styles.notAssigned}>
          <Typography variant="body1">
            Not assigned
          </Typography>
        </div>
      )}
    </div>
  );

  const renderDriverView = () => (
    <div className={styles.container}>
      <Typography variant="h6" gutterBottom>
        Rider Information
      </Typography>
      <PersonCard person={ride.rider} type="rider" showAccessibility />
    </div>
  );

  const renderAdminView = () => {
    const canEditRider = canChangeRider(ride, 'admin');
    const canEditDriver = canAssignDriver(ride, 'admin');

    return (
      <div className={styles.container}>
        <div className={styles.adminContainer}>
          <div className={styles.adminCard}>
            <Typography variant="subtitle1" gutterBottom>
              Rider
            </Typography>
            {isEditing && canEditRider ? (
              <div>
                {ride.rider && ride.rider.id ? (
                  <div>
                    <PersonCard person={ride.rider} type="rider" showAccessibility />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setRiderSelectOpen(true)}
                      sx={{ mt: 1 }}
                    >
                      Change Rider
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className={styles.notAssigned}>
                      <Typography variant="body1">
                        Not assigned
                      </Typography>
                    </div>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PersonAddIcon />}
                      onClick={() => setRiderSelectOpen(true)}
                      sx={{ mt: 1 }}
                    >
                      Assign Rider
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              ride.rider && ride.rider.id ? (
                <PersonCard person={ride.rider} type="rider" showAccessibility />
              ) : (
                <div className={styles.notAssigned}>
                  <Typography variant="body1">
                    Not assigned
                  </Typography>
                </div>
              )
            )}
          </div>
          <div className={styles.adminCard}>
            <Typography variant="subtitle1" gutterBottom>
              Driver
            </Typography>
            {isEditing && canEditDriver ? (
            <div>
              {ride.driver ? (
                <div>
                  <PersonCard person={ride.driver} type="driver" />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setDriverSelectOpen(true)}
                    sx={{ mt: 1 }}
                  >
                    Change Driver
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    color="error"
                    onClick={() => handleDriverSelect(null)}
                    sx={{ mt: 1, ml: 1 }}
                  >
                    Remove Driver
                  </Button>
                </div>
              ) : (
                <div>
                  <div className={styles.notAssigned}>
                    <Typography variant="body1">
                      Not assigned
                    </Typography>
                  </div>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setDriverSelectOpen(true)}
                    sx={{ mt: 1 }}
                  >
                    Assign Driver
                  </Button>
                </div>
              )}
            </div>
            ) : (
              ride.driver ? (
                <PersonCard person={ride.driver} type="driver" />
              ) : (
                <div className={styles.notAssigned}>
                  <Typography variant="body1">
                    Not assigned
                  </Typography>
                </div>
              )
            )}
          </div>
        </div>

      {/* Driver Selection Dialog */}
      <Dialog 
        open={driverSelectOpen} 
        onClose={() => setDriverSelectOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Driver</DialogTitle>
        <DialogContent>
          {loadingDrivers ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : driversError ? (
            <Box display="flex" flexDirection="column" alignItems="center" p={3}>
              <Typography color="error" gutterBottom>{driversError}</Typography>
              <Button variant="outlined" onClick={fetchDrivers} size="small">
                Retry
              </Button>
            </Box>
          ) : Array.isArray(drivers) && drivers.length > 0 ? (
            <List>
              {drivers.map((driver) => (
                <ListItem
                  key={driver.id}
                  component="div"
                  onClick={() => handleDriverSelect(driver)}
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <ListItemAvatar>
                    <Avatar src={driver.photoLink}>
                      {driver.firstName?.charAt(0)}{driver.lastName?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${driver.firstName} ${driver.lastName}`}
                    secondary={driver.email}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box display="flex" justifyContent="center" p={3}>
              <Typography color="textSecondary">No drivers available</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDriverSelectOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rider Selection Dialog */}
      <Dialog 
        open={riderSelectOpen} 
        onClose={() => setRiderSelectOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Rider</DialogTitle>
        <DialogContent>
          {loadingRiders ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : ridersError ? (
            <Box display="flex" flexDirection="column" alignItems="center" p={3}>
              <Typography color="error" gutterBottom>{ridersError}</Typography>
              <Button variant="outlined" onClick={fetchRiders} size="small">
                Retry
              </Button>
            </Box>
          ) : Array.isArray(riders) && riders.length > 0 ? (
            <List>
              {riders.map((rider) => (
                <ListItem
                  key={rider.id}
                  component="div"
                  onClick={() => handleRiderSelect(rider)}
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <ListItemAvatar>
                    <Avatar src={rider.photoLink}>
                      {rider.firstName?.charAt(0)}{rider.lastName?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${rider.firstName} ${rider.lastName}`}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {rider.email}
                        </Typography>
                        {rider.accessibility && rider.accessibility.length > 0 && (
                          <Typography variant="caption" color="textSecondary">
                            Accessibility: {rider.accessibility.join(', ')}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box display="flex" justifyContent="center" p={3}>
              <Typography color="textSecondary">No riders available</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRiderSelectOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
    );
  };

  switch (userRole) {
    case 'rider':
      return renderRiderView();
    case 'driver':
      return renderDriverView();
    case 'admin':
      return renderAdminView();
    default:
      return renderRiderView();
  }
};

export default RidePeople;