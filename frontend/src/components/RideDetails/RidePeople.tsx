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
import { RiderType } from '@carriage-web/shared/types/rider';
import { DriverType } from '@carriage-web/shared/types/driver';
import { useRideEdit } from './RideEditContext';
import { canChangeRider, canAssignDriver } from '../../util/rideValidation';
import { useRides } from '../../context/RidesContext';
import { useEmployees } from '../../context/EmployeesContext';
import axios from '../../util/axios';
import RiderList from './RiderList';
import SearchPopup from './SearchPopup';
import { SearchableType } from '../../utils/searchConfig';

interface RidePeopleProps {
  userRole: 'rider' | 'driver' | 'admin';
}

interface PersonCardProps {
  person: DriverType | RiderType;
  type: 'driver' | 'rider';
  showAccessibility?: boolean;
}

const PersonCard: React.FC<PersonCardProps> = ({
  person,
  type,
  showAccessibility = false,
}) => {
  const isRider = type === 'rider';
  const rider = isRider ? (person as RiderType) : undefined;

  return (
    <div className="h-full rounded-lg flex flex-col">
      <CardContent>
        <div className="flex items-center mb-3 gap-3 max-md:mb-2 max-md:gap-2.5">
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
        <div className="flex flex-col gap-1.5 mb-3 max-md:mb-2 max-md:gap-1">
          {person.phoneNumber && (
            <div className="flex items-center gap-2">
              <IconButton size="small" aria-label="Call">
                <PhoneIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2">{person.phoneNumber}</Typography>
            </div>
          )}
          {person.email && (
            <div className="flex items-center gap-2">
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
            <div className="border-t border-[#e0e0e0] mt-3 pt-3 max-md:mt-2 max-md:pt-2">
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Accessibility Needs
              </Typography>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
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

  const [drivers, setDrivers] = useState<DriverType[]>([]);
  const [driverSelectOpen, setDriverSelectOpen] = useState(false);
  const driverButtonRef = useRef<HTMLButtonElement>(null);

  // Ref to store the driver assigned when editing started
  const originalDriverRef = useRef<DriverType | null>(null);

  // Track the temp driver changes (before saving)
  const [tempCurrentDriver, setTempCurrentDriver] = useState<DriverType | null>(
    ride.driver || null
  );

  const [riders, setRiders] = useState<RiderType[]>([]);
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

  const handleDriverSelect = (driver: DriverType) => {
    setTempCurrentDriver(driver);
    updateRideField('driver', driver);
    setDriverSelectOpen(false);
  };

  const handleRiderSelect = (rider: RiderType) => {
    const currentRiders = ride.riders || [];
    if (!currentRiders.find((r) => r.id === rider.id)) {
      updateRideField('riders', [...currentRiders, rider]);
    }
    setRiderSelectOpen(false);
  };

  const handleRemoveRider = (rider: RiderType) => {
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
    <div className="max-w-200 h-full flex flex-col">
      <div className="flex gap-4 flex-wrap flex-1 content-start overflow-hidden max-md:flex-col max-md:gap-3 max-md:flex-nowrap">
        <div className="flex-1 min-w-70 flex flex-col overflow-hidden max-md:min-w-0 max-md:flex-none">
          <Typography variant="subtitle1" gutterBottom>
            Driver
          </Typography>
          <div className="h-80 flex flex-col overflow-hidden">
            <div className="h-full overflow-y-auto flex flex-col border border-[#e0e0e0] rounded-lg p-1.5">
              {ride.driver ? (
                <PersonCard person={ride.driver} type="driver" />
              ) : (
                <div className="flex items-center justify-center h-full text-[#666] bg-[#f5f5f5] border border-dashed border-[#ccc] rounded-lg">
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
    <div className="max-w-200 h-full flex flex-col">
      <div className="flex gap-4 flex-wrap flex-1 content-start overflow-hidden max-md:flex-col max-md:gap-3 max-md:flex-nowrap">
        <div className="flex-1 min-w-70 flex flex-col overflow-hidden max-md:min-w-0 max-md:flex-none">
          <Typography variant="subtitle1" gutterBottom>
            Riders ({ride.riders?.length || 0})
          </Typography>
          <div className="h-80 flex flex-col overflow-hidden">
            <div className="h-full overflow-y-auto flex flex-col border border-[#e0e0e0] rounded-lg p-1.5">
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
      <div className="max-w-200 h-full flex flex-col">
        <div className="flex gap-4 flex-wrap flex-1 content-start overflow-hidden max-md:flex-col max-md:gap-3 max-md:flex-nowrap">
          <div className="flex-1 min-w-70 flex flex-col overflow-hidden max-md:min-w-0 max-md:flex-none">
            <Typography variant="subtitle1" gutterBottom>
              Riders ({ride.riders?.length || 0})
            </Typography>
            <div className="h-80 flex flex-col overflow-hidden">
              <div className="h-full overflow-y-auto flex flex-col border border-[#e0e0e0] rounded-lg p-1.5">
                <RiderList
                  riders={ride.riders || []}
                  showAccessibility
                  hideHeader
                />
              </div>
            </div>
            {isEditing && canEditRider && (
              <div className="mt-auto pt-4 shrink-0">
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
          <div className="flex-1 min-w-70 flex flex-col overflow-hidden max-md:min-w-0 max-md:flex-none">
            <Typography variant="subtitle1" gutterBottom>
              Driver
            </Typography>
            <div className="h-80 flex flex-col overflow-hidden">
              <div className="h-full overflow-y-auto flex flex-col border border-[#e0e0e0] rounded-lg p-1.5">
                {tempCurrentDriver ? (
                  <PersonCard person={tempCurrentDriver} type="driver" />
                ) : (
                  <div className="flex items-center justify-center h-full text-[#666] bg-[#f5f5f5] border border-dashed border-[#ccc] rounded-lg">
                    <Typography variant="body1">Not assigned</Typography>
                  </div>
                )}
              </div>
            </div>
            {isEditing && canEditDriver && (
              <div className="mt-auto pt-4 shrink-0">
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
        <SearchPopup<DriverType>
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
        <SearchPopup<RiderType>
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
