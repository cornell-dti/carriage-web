import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Button,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import { Driver, Rider } from '../../types';
import { useRideEdit } from './RideEditContext';
import { canChangeRider, canAssignDriver } from '../../util/rideValidation';
import { useRides } from '../../context/RidesContext';
import { useEmployees } from '../../context/EmployeesContext';
import axios from '../../util/axios';
import RiderList from './RiderList';
import SearchPopup from './SearchPopup';
import { SearchableType } from '../../utils/searchConfig';
import styles from './RidePeople.module.css';

interface RidePeopleProps {
  userRole: 'rider' | 'driver' | 'admin';
}

interface PersonCardProps {
  person: Driver | Rider;
  type: 'driver' | 'rider';
  showAccessibility?: boolean;
}

const PersonCard: React.FC<PersonCardProps> = ({
  person,
  type,
  showAccessibility = false,
}) => {
  const isRider = type === 'rider';
  const rider = isRider ? (person as Rider) : undefined;

  return (
    <div className={styles.personCard}>
      <CardContent>
        <div className={styles.personHeader}>
          <Avatar src={person.photoLink} sx={{ width: 48, height: 48 }}>
            {person.firstName?.charAt(0)}
            {person.lastName?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
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
              <IconButton size="small" aria-label="Call">
                <PhoneIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2">{person.phoneNumber}</Typography>
            </div>
          )}
          {person.email && (
            <div className={styles.contactRow}>
              <IconButton size="small" aria-label="Email">
                <EmailIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2">{person.email}</Typography>
            </div>
          )}
        </div>

        {/* Accessibility needs for riders */}
        {showAccessibility &&
          rider?.accessibility &&
          rider.accessibility.length > 0 && (
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
  const { getAvailableRiders } = useRides();
  const {
    drivers: employeesDrivers,
    loading: employeesLoading,
    error: employeesError,
  } = useEmployees();
  const ride = editedRide!;

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driverSelectOpen, setDriverSelectOpen] = useState(false);
  const driverButtonRef = useRef<HTMLButtonElement>(null);

  // Ref to store the driver assigned when editing started
  const originalDriverRef = useRef<Driver | null>(null);

  // Track the temp driver changes (before saving)
  const [tempCurrentDriver, setTempCurrentDriver] = useState<Driver | null>(
    ride.driver || null
  );

  const [riders, setRiders] = useState<Rider[]>([]);
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [riderSelectOpen, setRiderSelectOpen] = useState(false);
  const [ridersError, setRidersError] = useState<string | null>(null);
  const riderButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch data and set initial state when editing starts
  useEffect(() => {
    if (isEditing && userRole === 'admin') {
      // Snapshot the driver at the start of the edit session
      const driverAtEditStart = ride.driver || null;
      originalDriverRef.current = driverAtEditStart;
      setTempCurrentDriver(driverAtEditStart);

      // Initialize drivers from the global employees context
      setDrivers(employeesDrivers || []);
      fetchRiders();
    }
    // This effect should only run once when isEditing becomes true
  }, [isEditing, userRole]);

  // Keep local drivers list in sync with global employees drivers while editing
  useEffect(() => {
    if (isEditing && userRole === 'admin') {
      setDrivers(employeesDrivers || []);
    }
  }, [employeesDrivers, isEditing, userRole]);

  // Refetch available riders when ride times change
  useEffect(() => {
    if (isEditing && userRole === 'admin' && ride.startTime && ride.endTime) {
      fetchRiders();
    }
  }, [ride.startTime, ride.endTime, isEditing, userRole]);

  const fetchRiders = async () => {
    setLoadingRiders(true);
    setRidersError(null);
    try {
      // If we have start and end times, get available riders
      if (ride.startTime && ride.endTime) {
        const availableRiders = await getAvailableRiders(
          ride.startTime,
          ride.endTime
        );
        setRiders(availableRiders);
      } else {
        // Fallback to all riders if no times are set
        const response = await axios.get('/api/riders');
        const ridersData = response.data?.data || response.data;
        const ridersArray = Array.isArray(ridersData) ? ridersData : [];
        setRiders(ridersArray);
      }
    } catch (error) {
      console.error('Failed to fetch riders:', error);
      setRidersError('Failed to load riders');
      setRiders([]);
    } finally {
      setLoadingRiders(false);
    }
  };

  const handleDriverSelect = (driver: Driver) => {
    setTempCurrentDriver(driver);
    updateRideField('driver', driver);
    setDriverSelectOpen(false);
  };

  const handleRiderSelect = (rider: Rider) => {
    const currentRiders = ride.riders || [];
    if (!currentRiders.find((r) => r.id === rider.id)) {
      updateRideField('riders', [...currentRiders, rider]);
    }
    setRiderSelectOpen(false);
  };

  const handleRemoveRider = (rider: Rider) => {
    const currentRiders = ride.riders || [];
    updateRideField(
      'riders',
      currentRiders.filter((r) => r.id !== rider.id)
    );
  };

  const handleRemoveDriver = () => {
    setTempCurrentDriver(null);
    updateRideField('driver', null);
  };

  const renderRiderView = () => (
    <div className={styles.container}>
      <div className={styles.adminContainer}>
        <div className={styles.adminCard}>
          <Typography variant="subtitle1" gutterBottom>
            Driver
          </Typography>
          <div className={styles.contentArea}>
            <div className={styles.riderListContainer}>
              {ride.driver ? (
                <PersonCard person={ride.driver} type="driver" />
              ) : (
                <div className={styles.notAssigned}>
                  <Typography variant="body1">Not assigned</Typography>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDriverView = () => (
    <div className={styles.container}>
      <div className={styles.adminContainer}>
        <div className={styles.adminCard}>
          <Typography variant="subtitle1" gutterBottom>
            Riders ({ride.riders?.length || 0})
          </Typography>
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
      </div>
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
              Riders ({ride.riders?.length || 0})
            </Typography>
            <div className={styles.contentArea}>
              <div className={styles.riderListContainer}>
                <RiderList
                  riders={ride.riders || []}
                  showAccessibility
                  hideHeader
                />
              </div>
            </div>
            {isEditing && canEditRider && (
              <div className={styles.actionButtons}>
                <Button
                  ref={riderButtonRef}
                  variant="outlined"
                  size="small"
                  startIcon={<SettingsIcon />}
                  onClick={() => setRiderSelectOpen(!riderSelectOpen)}
                >
                  Manage Riders
                </Button>
              </div>
            )}
          </div>
          <div className={styles.adminCard}>
            <Typography variant="subtitle1" gutterBottom>
              Driver
            </Typography>
            <div className={styles.contentArea}>
              <div className={styles.riderListContainer}>
                {tempCurrentDriver ? (
                  <PersonCard person={tempCurrentDriver} type="driver" />
                ) : (
                  <div className={styles.notAssigned}>
                    <Typography variant="body1">Not assigned</Typography>
                  </div>
                )}
              </div>
            </div>
            {isEditing && canEditDriver && (
              <div className={styles.actionButtons}>
                {tempCurrentDriver ? (
                  <>
                    <Button
                      ref={driverButtonRef}
                      variant="outlined"
                      size="small"
                      onClick={() => setDriverSelectOpen(!driverSelectOpen)}
                      sx={{ mr: 1 }}
                    >
                      Change Driver
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      color="error"
                      onClick={handleRemoveDriver}
                    >
                      Remove Driver
                    </Button>
                  </>
                ) : (
                  <Button
                    ref={driverButtonRef}
                    variant="contained"
                    size="small"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setDriverSelectOpen(!driverSelectOpen)}
                  >
                    Assign Driver
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Driver Selection Popup */}
        <SearchPopup<Driver>
          open={driverSelectOpen}
          onClose={() => setDriverSelectOpen(false)}
          onSelect={handleDriverSelect}
          items={(() => {
            let allDrivers = drivers;
            const originalDriver = originalDriverRef.current;

            // Add the original driver to the list if they aren't in the available list
            if (
              originalDriver &&
              !drivers.find((d) => d.id === originalDriver.id)
            ) {
              allDrivers = [...drivers, originalDriver];
            }

            // Filter out the currently selected temporary driver from the options
            return allDrivers.filter(
              (driver) => driver.id !== tempCurrentDriver?.id
            );
          })()}
          searchType={SearchableType.DRIVER}
          loading={employeesLoading}
          error={employeesError ? employeesError.message : null}
          title="Select Driver"
          placeholder="Search drivers..."
          selectedItems={tempCurrentDriver ? [tempCurrentDriver] : []}
          onRemove={handleRemoveDriver}
          anchorEl={driverButtonRef.current}
        />

        {/* Rider Selection Popup */}
        <SearchPopup<Rider>
          open={riderSelectOpen}
          onClose={() => setRiderSelectOpen(false)}
          onSelect={handleRiderSelect}
          items={riders.filter(
            (rider) => !(ride.riders || []).find((r) => r.id === rider.id)
          )}
          searchType={SearchableType.RIDER}
          loading={loadingRiders}
          error={ridersError}
          title="Manage Riders"
          placeholder="Search riders..."
          selectedItems={ride.riders || []}
          onRemove={handleRemoveRider}
          showAccessibility={true}
          anchorEl={riderButtonRef.current}
        />
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
