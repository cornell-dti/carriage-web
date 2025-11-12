import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from '@mui/x-date-pickers';
import { APIProvider } from '@vis.gl/react-google-maps';
import RequestRideMap from './RequestRideMap';
import styles from './requestridedialog.module.css';
import { Ride, Location, Tag } from 'types';
import axios from '../../util/axios';
import { useLocations } from '../../context/LocationsContext';
import RequestRidePlacesSearch from './RequestRidePlacesSearch';
import PlacesSearch from 'components/Locations/PlacesSearch';

type RepeatOption = 'none' | 'daily' | 'weekly' | 'custom';

export interface FormData {
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  date: Date | null;
  time: Date | null;
  repeatType: RepeatOption;
  repeatEndDate: Date | null;
  selectedDays: string[];
}

type SelectionState = 'pickup' | 'dropoff' | 'complete';

interface RequestRideDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  supportedLocations: Location[];
  ride?: Ride;
}

const repeatOptions: Array<{ value: RepeatOption; label: string }> = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' },
];

const daysOfWeek = ['M', 'T', 'W', 'Th', 'F'] as const;
const fullDayNames = {
  M: 'Monday',
  T: 'Tuesday',
  W: 'Wednesday',
  Th: 'Thursday',
  F: 'Friday',
} as const;

//Other for dropdown
const Other = {
  id: 'other',
  name: 'Other',
  address: '',
  shortName: '',
  info: '',
  tag: Tag.CUSTOM,
  lat: 0,
  lng: 0,
  photoLink: '',
  images: [''],
} as Location;

/**
 * RequestRideDialog component - A dialog for Riders to request a ride.
 *
 * @remarks
 * This component is used to on the rider page when they request or edit a ride,
 * where it asks the user to input/edit pickup and drop-off locations, date, time,
 * and repeat options. It uses Material-UI components for consistent styling.
 *
 * @param props - Contains:
 *  - open: boolean - Controls the visibility of the dialog.
 *  -  onClose: function - Function to close the dialog.
 *  - onSubmit: function - Function to handle form submission.
 *  - supportedLocations: array of Location - List of locations available for drop-off.
 *  - ride: Ride - Optional ride object to prepopulate the form for editing.
 */
const RequestRideDialog: React.FC<RequestRideDialogProps> = ({
  open,
  onClose,
  onSubmit,
  supportedLocations,
  ride,
}) => {
  const supportLocWithOther = [...(supportedLocations ?? []), Other];
  const [formData, setFormData] = useState<FormData>({
    pickupLocation: null,
    dropoffLocation: null,
    date: null,
    time: null,
    repeatType: 'none',
    repeatEndDate: null,
    selectedDays: [],
  });

  // New state for the selection flow
  const [selectionState, setSelectionState] =
    useState<SelectionState>('pickup');
  const [pendingLocation, setPendingLocation] = useState<Location | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [customPickup, setCustomPickup] = useState(false);


  useEffect(() => {
    if (ride && open) {
      // Prefill form with existing ride data
      const startDate = new Date(ride.startTime);
      const endDate = new Date(ride.endTime);

      setFormData({
        pickupLocation: ride.startLocation,
        dropoffLocation: ride.endLocation,
        date: startDate,
        time: startDate,
        repeatType: 'none', // Default to no repeat for editing
        repeatEndDate: null,
        selectedDays: [],
      });
      setSelectionState('complete');
    }
    if (!open) {
      setFormData({
        pickupLocation: null,
        dropoffLocation: null,
        date: null,
        time: null,
        repeatType: 'none',
        repeatEndDate: null,
        selectedDays: [],
      });
      setSelectionState('pickup');
      setPendingLocation(null);
      setConfirmDialogOpen(false);
    }
  }, [open, ride]);

  // New handlers for map-based selection
  const handleLocationSelect = (location: Location | null) => {
    if (location) {
      setPendingLocation(location);
      setConfirmDialogOpen(true);
    }
  };

  const confirmLocationSelection = () => {
    if (!pendingLocation) return;

    if (selectionState === 'pickup') {
      setFormData((prev) => ({ ...prev, pickupLocation: pendingLocation }));
      setSelectionState('dropoff');
    } else if (selectionState === 'dropoff') {
      setFormData((prev) => ({ ...prev, dropoffLocation: pendingLocation }));
      setSelectionState('complete');
    }

    setPendingLocation(null);
    setConfirmDialogOpen(false);
  };

  const cancelLocationSelection = () => {
    setPendingLocation(null);
    setConfirmDialogOpen(false);
  };

  const resetSelection = () => {
    setFormData((prev) => ({
      ...prev,
      pickupLocation: null,
      dropoffLocation: null,
    }));
    setSelectionState('pickup');
  };

  // Get available locations based on current selection state
  const getAvailableLocations = () => {
    if (selectionState === 'pickup') {
      // Show all locations for pickup selection
      return supportLocWithOther;
    } else if (selectionState === 'dropoff') {
      // Show all locations except the selected pickup location
      return supportLocWithOther.filter(
        (loc) => loc.id !== formData.pickupLocation?.id
      );
    } else {
      // Show only selected locations
      return [formData.pickupLocation, formData.dropoffLocation].filter(
        Boolean
      ) as Location[];
    }
  };

  // Legacy handler for dropdown (keeping for backward compatibility)
  const handleDropoffChange = (event: SelectChangeEvent<string>) => {
    const locationId = event.target.value as string;
    const selectedLocation =
      supportedLocations.find((loc) => loc.id === locationId) || null;
    setFormData((prev) => ({
      ...prev,
      dropoffLocation: selectedLocation,
    }));
  };

  const handleDateChange =
    (field: keyof Pick<FormData, 'date' | 'time' | 'repeatEndDate'>) =>
    (newDate: Date | null) => {
      setFormData({
        ...formData,
        [field]: newDate,
      });
    };

  const handleRepeatTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value as RepeatOption;
    setFormData((prev) => ({
      ...prev,
      repeatType: value,
      // Reset selected days when changing repeat type
      selectedDays: value !== 'custom' ? [] : prev.selectedDays,
    }));
  };

  const handleDaysChange = (
    event: React.MouseEvent<HTMLElement>,
    newDays: string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      selectedDays: newDays.map(
        (shortDay) => fullDayNames[shortDay as keyof typeof fullDayNames]
      ),
    }));
  };

  const handleSubmit = async () => {
    onSubmit(formData);
    onClose();
  };

  const isFormValid = () => {
    return (
      formData.pickupLocation &&
      formData.dropoffLocation &&
      formData.date &&
      formData.time &&
      (formData.repeatType !== 'custom' || formData.selectedDays.length > 0) &&
      (formData.repeatType === 'none' || formData.repeatEndDate) &&
      selectionState === 'complete'
    );
  };

  const getShortDay = (fullDay: string) => {
    return (
      Object.entries(fullDayNames).find(
        ([_, value]) => value === fullDay
      )?.[0] || ''
    );
  };

  // Prevent "Other" from being sent to the map

        const safePickup =
    formData.pickupLocation?.id === 'other' ||
    (formData.pickupLocation?.lat === 0 && formData.pickupLocation?.lng === 0)
      ? null
      : formData.pickupLocation;

    const safeDropoff =
    formData.dropoffLocation?.id === 'other' ||
    (formData.dropoffLocation?.lat === 0 && formData.dropoffLocation?.lng === 0)
      ? null
      : formData.dropoffLocation;

  //TODO: add edit dialog functionality that prepopulates the form with existing ride data
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{!ride ? 'Request a Ride' : 'Edit Ride'}</DialogTitle>
      <DialogContent>
        {/* Wrap everything in a single APIProvider */}
        <APIProvider
          apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string}
          libraries={['places']}
        >
          <div className={styles.formContainer}>
            <div className={styles.formColumn}>
              <div className={styles.formSection}>
                {/* Selection Progress Indicator */}
                <div
                  style={{
                    marginBottom: '20px',
                    padding: '16px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                  }}
                >
                  <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>
                    Location Selection
                  </h4>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: formData.pickupLocation
                          ? '#4caf50'
                          : selectionState === 'pickup'
                          ? '#2196f3'
                          : '#e0e0e0',
                        color: 'white',
                        fontSize: '12px',
                      }}
                    >
                      1. Pickup {formData.pickupLocation ? '✓' : ''}
                    </div>
                    <div
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: formData.dropoffLocation
                          ? '#4caf50'
                          : selectionState === 'dropoff'
                          ? '#2196f3'
                          : '#e0e0e0',
                        color: 'white',
                        fontSize: '12px',
                      }}
                    >
                      2. Dropoff {formData.dropoffLocation ? '✓' : ''}
                    </div>
                  </div>
                  {selectionState === 'pickup' && (
                    <p
                      style={{
                        margin: '8px 0 0 0',
                        fontSize: '14px',
                        color: '#666',
                      }}
                    >
                      Click on a location on the map or use the dropdown below
                      to select your pickup point
                    </p>
                  )}
                  {selectionState === 'dropoff' && (
                    <p
                      style={{
                        margin: '8px 0 0 0',
                        fontSize: '14px',
                        color: '#666',
                      }}
                    >
                      Click on a location on the map or use the dropdown below
                      to select your dropoff point
                    </p>
                  )}
                  {selectionState === 'complete' && (
                    <p
                      style={{
                        margin: '8px 0 0 0',
                        fontSize: '14px',
                        color: '#4caf50',
                      }}
                    >
                      ✓ Both locations selected! Complete the form below.
                    </p>
                  )}
                  {selectionState === 'complete' && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={resetSelection}
                      style={{ marginTop: '8px' }}
                    >
                      Change Locations
                    </Button>
                  )}
                </div>

                {/* Show selected locations */}
                {formData.pickupLocation && (
                  <div
                    style={{
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '4px',
                    }}
                  >
                    <strong>Pickup:</strong> {formData.pickupLocation.name}
                  </div>
                )}
                {formData.dropoffLocation && (
                  <div
                    style={{
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: '#e8f5e8',
                      borderRadius: '4px',
                    }}
                  >
                    <strong>Dropoff:</strong> {formData.dropoffLocation.name}
                  </div>
                )}

                {/* Dropdown selectors as alternative to map selection */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>
                    Or select from dropdown:
                  </h4>

                  <FormControl fullWidth style={{ marginBottom: '16px' }}>
                    <InputLabel>Pickup Location</InputLabel>
                    <Select<string>
                      value={formData.pickupLocation?.id || ''}
                      onChange={(event) => {
                        const locationId = event.target.value as string;
                        const selectedLocation =
                          supportLocWithOther.find(
                            (loc) => loc.id === locationId
                          ) || null;
                        setFormData((prev) => ({
                          ...prev,
                          pickupLocation: selectedLocation,
                        }));
                        // Update selection state
                        if (selectedLocation && !formData.dropoffLocation) {
                          setSelectionState('dropoff');
                        } else if (
                          selectedLocation &&
                          formData.dropoffLocation
                        ) {
                          setSelectionState('complete');
                        }
                        if (selectedLocation?.name === Other.name) {
                          setCustomPickup(true);
                        } else {
                          setCustomPickup(false);
                        }
                      }}
                      label="Pickup Location"
                    >
                      {supportLocWithOther.map((location) => (
                        <MenuItem key={location.id} value={location.id}>
                          {location.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {customPickup === true && (
                   <div >
                    </div>

                    //add here!!!! quack
                  )}

                  <FormControl fullWidth>
                    <InputLabel>Drop-off Location</InputLabel>
                    <Select<string>
                      value={formData.dropoffLocation?.id || ''}
                      onChange={(event) => {
                        const locationId = event.target.value as string;
                        const selectedLocation =
                          supportLocWithOther.find(
                            (loc) => loc.id === locationId
                          ) || null;
                        setFormData((prev) => ({
                          ...prev,
                          dropoffLocation: selectedLocation,
                        }));
                        // Update selection state
                        if (selectedLocation && formData.pickupLocation) {
                          setSelectionState('complete');
                        }
                      }}
                      label="Drop-off Location"
                    >
                      {supportLocWithOther
                        .filter((loc) => loc.id !== formData.pickupLocation?.id) // Don't show pickup location as dropoff option
                        .map((location) => (
                          <MenuItem key={location.id} value={location.id}>
                            {location.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </div>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Stack direction="row" spacing={2}>
                    <DatePicker
                      label="Date"
                      value={formData.date}
                      onChange={handleDateChange('date')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        },
                      }}
                    />
                    <TimePicker
                      label="Time"
                      value={formData.time}
                      onChange={handleDateChange('time')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        },
                      }}
                    />
                  </Stack>
                </LocalizationProvider>

                <FormControl component="fieldset">
                  <FormLabel component="legend">Repeat Options</FormLabel>
                  <RadioGroup
                    value={formData.repeatType}
                    onChange={handleRepeatTypeChange}
                  >
                    {repeatOptions.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio />}
                        label={option.label}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>

                {formData.repeatType !== 'none' && (
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Repeat End Date"
                      value={formData.repeatEndDate}
                      onChange={handleDateChange('repeatEndDate')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        },
                      }}
                    />
                  </LocalizationProvider>
                )}

                {formData.repeatType === 'custom' && (
                  <div className={styles.daySelectionContainer}>
                    <FormLabel
                      component="legend"
                      className={styles.daySelectionLabel}
                    >
                      Select Days
                    </FormLabel>
                    <ToggleButtonGroup
                      value={formData.selectedDays.map(getShortDay)}
                      onChange={handleDaysChange}
                      aria-label="select days"
                      className={styles.toggleButtonGroup}
                    >
                      {daysOfWeek.map((day) => (
                        <ToggleButton
                          key={day}
                          value={day}
                          aria-label={fullDayNames[day]}
                          className={styles.dayToggleButton}
                        >
                          {day}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.mapColumn}>
              <RequestRideMap
                pickupLocation={safePickup}
                dropoffLocation={safeDropoff}
                availableLocations={getAvailableLocations()}
                onPickupSelect={handleLocationSelect}
                onDropoffSelect={handleLocationSelect}
              />
            </div>
          </div>
        </APIProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!isFormValid()}
        >
          Submit Request
        </Button>
      </DialogActions>

      {/* Confirmation Dialog for Location Selection */}
      <Dialog open={confirmDialogOpen} onClose={cancelLocationSelection}>
        <div style={{ padding: '20px', minWidth: '300px' }}>
          <h4 style={{ marginBottom: '16px', color: '#1976d2' }}>
            Confirm {selectionState === 'pickup' ? 'Pickup' : 'Dropoff'}{' '}
            Location
          </h4>
          {pendingLocation && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Location:</strong> {pendingLocation.name}
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Address:</strong> {pendingLocation.address}
                </p>
                <p
                  style={{
                    margin: '0 0 16px 0',
                    fontSize: '12px',
                    color: '#666',
                  }}
                >
                  <strong>Coordinates:</strong> {pendingLocation.lat.toFixed(6)}
                  , {pendingLocation.lng.toFixed(6)}
                </p>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'flex-end',
                }}
              >
                <Button variant="outlined" onClick={cancelLocationSelection}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={confirmLocationSelection}>
                  Confirm {selectionState === 'pickup' ? 'Pickup' : 'Dropoff'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </Dialog>
  );
};

export default RequestRideDialog;
