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
  FormHelperText,
  TextField,
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
import { Tag } from 'types';
import { RideType } from '@carriage-web/shared/types/ride';
import { LocationType } from '@carriage-web/shared/types/location';
import RequestRidePlacesSearch from './RequestRidePlacesSearch';
import axios from '../../util/axios';

type RepeatOption = 'none' | 'daily' | 'weekly' | 'custom';

export interface FormData {
  pickupLocation: LocationType | null;
  dropoffLocation: LocationType | null;
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
  supportedLocations: LocationType[];
  ride?: RideType;
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
  id: 'custom' + crypto.randomUUID(),
  name: 'Custom',
  address: '',
  shortName: '',
  info: '',
  tag: Tag.CUSTOM,
  lat: 0,
  lng: 0,
  photoLink: '',
  images: [''],
} as LocationType;

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
  //official locations with other added
  const supportLocsWithOther = [Other, ...supportedLocations];

  const [formData, setFormData] = useState<FormData>({
    pickupLocation: null,
    dropoffLocation: null,
    date: null,
    time: null,
    repeatType: 'none', // Default to no repeat for editing
    repeatEndDate: null,
    selectedDays: [],
  });

  const [selectionState, setSelectionState] =
    useState<SelectionState>('pickup');
  const [pendingLocation, setPendingLocation] = useState<LocationType | null>(
    null
  );
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [customPickup, setCustomPickup] = useState(false);
  const [customDropoff, setCustomDropoff] = useState(false);
  const [inputPickUpError, setInputPickUpError] = useState(false);
  const [inputDropOffError, setInputDropOffError] = useState(false);
  const [inputErrorText, setInputErrorText] = useState('');
  const [customPickupName, setCustomPickupName] = useState('');
  const [customDropoffName, setCustomDropoffName] = useState('');

  useEffect(() => {
    if (ride && open) {
      const startDate = new Date(ride.startTime);

      setFormData({
        pickupLocation: ride.startLocation,
        dropoffLocation: ride.endLocation,
        date: startDate,
        time: startDate,
        repeatType: 'none',
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
      setCustomPickup(false);
      setCustomDropoff(false);
      setCustomPickupName('');
      setCustomDropoffName('');
      setInputPickUpError(false);
      setInputDropOffError(false);
      setInputErrorText('');
    }
  }, [open, ride]);

  // New handlers for map-based selection
  const handleLocationSelect = (location: LocationType | null) => {
    if (location) {
      setPendingLocation(location);
      setConfirmDialogOpen(true);
    }
  };

  /**
   * Finalizes  pending location selection after user confirms
   *
   * Depending on the current 'selectionState':
   *  - Saves as the pickup location or
   *  - Saves as the dropoff location
   *
   * Progresses the state machine to the next step.
   */
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

  /**
   * Resets the pickup/dropoff flow back to the beginning.
   *
   * Clears both selected locations and returns to the "pickup" phase.
   */
  const resetSelection = () => {
    setFormData((prev) => ({
      ...prev,
      pickupLocation: null,
      dropoffLocation: null,
    }));
    setSelectionState('pickup');
    setCustomPickup(false);
    setCustomDropoff(false);
    setCustomPickupName('');
    setCustomDropoffName('');
    setInputPickUpError(false);
    setInputDropOffError(false);
  };

  // clear any inputs/error
  const handleCancel = () => {
    setCustomPickup(false);
    setCustomDropoff(false);
    setCustomPickupName('');
    setCustomDropoffName('');
    setInputPickUpError(false);
    setInputDropOffError(false);
    setInputErrorText('');
    resetSelection();

    // close dialog
    onClose();
  };

  // Check if any custom location is being used
  const hasCustomLocation = () => {
    return customPickup || customDropoff;
  };

  // Get available locations based on current selection state
  const getAvailableLocations = () => {
    if (selectionState === 'pickup') {
      return supportLocsWithOther;
    } else if (selectionState === 'dropoff') {
      return supportLocsWithOther.filter(
        (loc) =>
          loc.id.startsWith('custom') || loc.id !== formData.pickupLocation?.id
      );
    } else {
      return [formData.pickupLocation, formData.dropoffLocation].filter(
        Boolean
      ) as LocationType[];
    }
  };

  const getAllLocs = async () => {
    const locationsData: Array<LocationType> = await axios
      .get('/api/locations')
      .then((res) => res.data)
      .then((data) => data.data);
    return locationsData;
  };

  /**
   * Strips address of variation
   * @function normalizeAddress
   *
   * @param {string} addr
   *
   * @returns {string}
   * An address in all lowercase with no punctuation with variations
   * between place names (such as USA vs United States) unified
   *
   * @description
   * This function ensures that the system properly normalizes an address
   * to make comparison simpler
   */
  const normalizeAddress = (addr: string) => {
    if (!addr) return '';

    //everything lowercase
    let a = addr.trim().toLowerCase();

    // collapse whitespace
    a = a.replace(/\s+/g, ' ');

    // remove punctuation
    a = a.replace(/[.,]/g, '');

    // country name variations unified
    a = a
      .replace(/\busa\b/g, 'united states')
      .replace(/\bus\b/g, 'united states');

    // state name variations unified
    a = a.replace(/\bny\b/g, 'new york');

    // road names variations unified
    a = a
      .replace(/\brd\b/g, 'road')
      .replace(/\bst\b/g, 'street')
      .replace(/\bave\b/g, 'avenue')
      .replace(/\bblvd\b/g, 'boulevard')
      .replace(/\bdr\b/g, 'drive');

    return a;
  };

  /**
   * Creates a new custom Location in the database OR returns an existing one
   * if it matches the provided address/coordinates.
   *
   * @async
   * @function createOrGetLocation
   *
   * @param {string} address
   * @param {number} lat
   * @param {number} lng
   * @returns {Promise<LocationType>}
   *          A resolved Location object — either:
   *          - an existing Location already stored in `allLocations`, OR
   *          - a newly created custom Location saved to the backend.
   * @description
   * This function ensures that the system does not create duplicate custom
   * locations. It does this by:
   *
   * 1. Normalizing the address
   *
   * 2. Searching for an existing Location via address or lat/lng matching
   *
   * 3. Creating a new Location if needed
   * This prevents multiple users from creating duplicate “custom” entries
   * for the exact same geolocation.
   *
   */
  const createOrGetLocation = async (
    address: string,
    lat: number,
    lng: number,
    isPickUp: boolean
  ): Promise<LocationType> => {
    const LOCATION_TOLERANCE = 0.00025; // ~25 meters

    const normalized = normalizeAddress(address);

    if (normalized === '') {
      if (isPickUp) {
        setInputPickUpError(true);
      } else {
        setInputDropOffError(true);
      }
      setInputErrorText('Attempted to submit an empty location');
      throw new Error('User tried to submit empty custom location');
    }

    const allLocs = getAllLocs();

    // checking db for if it already exists in Locations quack MUST CHANGE HERE
    console.log('Checking for address:', normalized);

    // check against allLocations (includes newly created custom ones)
    const matched = (await allLocs).find((loc) => {
      const addrMatch = normalizeAddress(loc.address) === normalized; // 1) is address the same
      const addrSimilar1 = normalizeAddress(loc.address).includes(normalized);
      const addrSimilar2 = normalized.includes(normalizeAddress(loc.address));
      const latMatch = Math.abs(loc.lat - lat) < LOCATION_TOLERANCE; // 2) are lat/long similar
      const lngMatch = Math.abs(loc.lng - lng) < LOCATION_TOLERANCE;
      console.log(
        `Checking ${loc.name}: addrMatch=${addrMatch}, addrSimilar1=${addrSimilar1}, addrSimilar2=${addrSimilar2}, latMatch=${latMatch}, lngMatch=${lngMatch}`
      );
      console.log(normalized + '     ' + normalizeAddress(loc.address));
      return (
        addrMatch || addrSimilar1 || addrSimilar2 || (latMatch && lngMatch)
      );
    });

    if (matched) {
      console.log('Found matching location:', matched);
      return matched; //if this location already exists, return it
    }

    console.log('No match found, creating new location');

    // else create new custom location
    const payload: Partial<LocationType> = {
      name: address.split(',')[0], // short name
      shortName: '',
      address,
      info: '',
      tag: Tag.CUSTOM,
      lat,
      lng,
    };

    const response = await axios.post('/api/locations/custom', payload); //add to locations
    const created: LocationType = response.data.data || response.data;
    return created;
  };

  /**
   * handlePickupSelect and handleDropoffSelect
   *
   * Store a custom pickup or dropoff location selected through Google Places search.
   * Creates a temporary placeholder based on the "Other" template.
   * Actual DB-backed Location is created later in handleSubmit via createOrGetLocation().
   */

  const handlePickupSelect = (address: string, lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      pickupLocation: { ...Other, address: address, lat: lat, lng: lng },
    }));
  };

  const handleDropoffSelect = (address: string, lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      dropoffLocation: { ...Other, address: address, lat: lat, lng: lng },
    }));
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

  const createCustomLocation = async (name: string): Promise<Location> => {
    console.log('Creating new custom location:', name);

    // Create new custom location
    const payload: Partial<Location> = {
      name: name.trim(),
      shortName: '',
      address: '', // Empty address for custom locations
      info: '',
      tag: Tag.CUSTOM,
      lat: 0, // Null coordinates for custom locations
      lng: 0,
    };

    const response = await axios.post('/api/locations/custom', payload);
    const created: Location = response.data.data || response.data;
    console.log('Created custom location:', created);
    return created;
  };

  const handleSubmit = async () => {
    try {
      let finalPickup = formData.pickupLocation;
      let finalDropoff = formData.dropoffLocation;

      // Handle custom pickup - create actual Location in DB
      if (customPickup) {
        if (!customPickupName.trim()) {
          setInputPickUpError(true);
          setInputErrorText('Pickup name cannot be empty');
          return;
        }
        finalPickup = await createCustomLocation(customPickupName);
      }

      // Handle custom dropoff - create actual Location in DB
      if (customDropoff) {
        if (!customDropoffName.trim()) {
          setInputDropOffError(true);
          setInputErrorText('Dropoff name cannot be empty');
          return;
        }
        finalDropoff = await createCustomLocation(customDropoffName);
      }

      onSubmit({
        ...formData,
        pickupLocation: finalPickup,
        dropoffLocation: finalDropoff,
      });

      // Reset state
      setCustomPickup(false);
      setCustomDropoff(false);
      setCustomPickupName('');
      setCustomDropoffName('');
      onClose();
    } catch (err) {
      console.error('Error submitting ride:', err);
      alert('Failed to submit ride. Please try again.');
    }
  };

  const isFormValid = () => {
    const hasPickup = customPickup
      ? customPickupName.trim() !== ''
      : formData.pickupLocation !== null;
    const hasDropoff = customDropoff
      ? customDropoffName.trim() !== ''
      : formData.dropoffLocation !== null;

    return (
      hasPickup &&
      hasDropoff &&
      formData.date &&
      formData.time &&
      (formData.repeatType !== 'custom' || formData.selectedDays.length > 0) &&
      (formData.repeatType === 'none' || formData.repeatEndDate)
    );
  };

  const getShortDay = (fullDay: string) => {
    return (
      Object.entries(fullDayNames).find(
        ([_, value]) => value === fullDay
      )?.[0] || ''
    );
  };

  // Only show map if not using custom locations
  const safePickup =
    !customPickup &&
    formData.pickupLocation?.lat &&
    formData.pickupLocation?.lng
      ? formData.pickupLocation
      : null;

  const safeDropoff =
    !customDropoff &&
    formData.dropoffLocation?.lat &&
    formData.dropoffLocation?.lng
      ? formData.dropoffLocation
      : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{!ride ? 'Request a Ride' : 'Edit Ride'}</DialogTitle>
      <DialogContent>
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
                        backgroundColor:
                          formData.pickupLocation || customPickupName
                            ? '#4caf50'
                            : selectionState === 'pickup'
                            ? '#2196f3'
                            : '#e0e0e0',
                        color: 'white',
                        fontSize: '12px',
                      }}
                    >
                      1. Pickup{' '}
                      {formData.pickupLocation || customPickupName ? '✓' : ''}
                    </div>
                    <div
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor:
                          formData.dropoffLocation || customDropoffName
                            ? '#4caf50'
                            : selectionState === 'dropoff'
                            ? '#2196f3'
                            : '#e0e0e0',
                        color: 'white',
                        fontSize: '12px',
                      }}
                    >
                      2. Dropoff{' '}
                      {formData.dropoffLocation || customDropoffName ? '✓' : ''}
                    </div>
                  </div>
                  {!hasCustomLocation() && selectionState === 'pickup' && (
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
                  {!hasCustomLocation() && selectionState === 'dropoff' && (
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
                  {hasCustomLocation() && (
                    <p
                      style={{
                        margin: '8px 0 0 0',
                        fontSize: '14px',
                        color: '#ff9800',
                      }}
                    >
                      ⚠ Custom location mode - map disabled. Enter location
                      names below.
                    </p>
                  )}
                  {!hasCustomLocation() &&
                    formData.pickupLocation &&
                    formData.dropoffLocation && (
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
                  {(formData.pickupLocation ||
                    formData.dropoffLocation ||
                    customPickupName ||
                    customDropoffName) && (
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
                {formData.pickupLocation && !customPickup && (
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
                {customPickupName && customPickup && (
                  <div
                    style={{
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: '#fff3e0',
                      borderRadius: '4px',
                    }}
                  >
                    <strong>Custom Pickup:</strong> {customPickupName}
                  </div>
                )}
                {formData.dropoffLocation && !customDropoff && (
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
                {customDropoffName && customDropoff && (
                  <div
                    style={{
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: '#fff3e0',
                      borderRadius: '4px',
                    }}
                  >
                    <strong>Custom Dropoff:</strong> {customDropoffName}
                  </div>
                )}

                {/* Dropdown selectors */}
                <div style={{ marginBottom: '5px' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>
                    {hasCustomLocation()
                      ? 'Location Selection:'
                      : 'Or select from dropdown:'}
                  </h4>

                  <FormControl fullWidth style={{ marginBottom: '16px' }}>
                    <InputLabel>Pickup Location</InputLabel>
                    <Select<string>
                      value={formData.pickupLocation?.id || ''}
                      onChange={(event) => {
                        const locationId = event.target.value as string;
                        const selectedLocation =
                          supportLocsWithOther.find(
                            (loc) => loc.id === locationId
                          ) || null;
                        setFormData((prev) => ({
                          ...prev,
                          pickupLocation: selectedLocation,
                        }));

                        if (selectedLocation?.name === Other.name) {
                          setCustomPickup(true);
                          setCustomPickupName('');
                        } else {
                          setCustomPickup(false);
                          setCustomPickupName('');
                          if (selectedLocation && !formData.dropoffLocation) {
                            setSelectionState('dropoff');
                          } else if (
                            selectedLocation &&
                            formData.dropoffLocation
                          ) {
                            setSelectionState('complete');
                          }
                        }
                        setInputPickUpError(false);
                      }}
                      label="Pickup Location"
                      error={inputPickUpError}
                    >
                      {supportLocsWithOther.map((location) => (
                        <MenuItem key={location.id} value={location.id}>
                          {location.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {inputPickUpError && (
                      <FormHelperText error>{inputErrorText}</FormHelperText>
                    )}
                  </FormControl>

                  {customPickup && (
                    <TextField
                      fullWidth
                      label="Custom Pickup Name"
                      placeholder="e.g., Uri's Hall Loading Dock"
                      value={customPickupName}
                      onChange={(e) => {
                        setCustomPickupName(e.target.value);
                        setInputPickUpError(false);
                      }}
                      error={inputPickUpError}
                      helperText={
                        inputPickUpError
                          ? inputErrorText
                          : 'Enter a descriptive name for this location'
                      }
                      style={{ marginBottom: '16px' }}
                    />
                  )}

                  <FormControl fullWidth>
                    <InputLabel>Drop-off Location</InputLabel>
                    <Select<string>
                      value={formData.dropoffLocation?.id || ''}
                      disabled={!formData.pickupLocation && !customPickup}
                      onChange={(event) => {
                        const locationId = event.target.value as string;
                        const selectedLocation =
                          supportLocsWithOther.find(
                            (loc) => loc.id === locationId
                          ) || null;
                        setFormData((prev) => ({
                          ...prev,
                          dropoffLocation: selectedLocation,
                        }));

                        if (selectedLocation?.name === Other.name) {
                          setCustomDropoff(true);
                          setCustomDropoffName('');
                        } else {
                          setCustomDropoff(false);
                          setCustomDropoffName('');
                          if (selectedLocation && formData.pickupLocation) {
                            setSelectionState('complete');
                          }
                        }
                        setInputDropOffError(false);
                      }}
                      label="Drop-off Location"
                      error={inputDropOffError}
                    >
                      {supportLocsWithOther
                        .filter(
                          (loc) =>
                            loc.id.startsWith('custom') ||
                            loc.id !== formData.pickupLocation?.id
                        )
                        .map((location) => (
                          <MenuItem key={location.id} value={location.id}>
                            {location.name}
                          </MenuItem>
                        ))}
                    </Select>
                    {inputDropOffError && (
                      <FormHelperText error>{inputErrorText}</FormHelperText>
                    )}
                    {!formData.pickupLocation && !customPickup && (
                      <FormHelperText>
                        Please choose pickup location first
                      </FormHelperText>
                    )}
                  </FormControl>

                  {customDropoff && (
                    <TextField
                      fullWidth
                      label="Custom Dropoff Name"
                      placeholder="e.g., Main Entrance Side Door"
                      value={customDropoffName}
                      onChange={(e) => {
                        setCustomDropoffName(e.target.value);
                        setInputDropOffError(false);
                      }}
                      error={inputDropOffError}
                      helperText={
                        inputDropOffError
                          ? inputErrorText
                          : 'Enter a descriptive name for this location'
                      }
                      style={{ marginTop: '16px' }}
                    />
                  )}
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
              {hasCustomLocation() ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: '18px',
                        color: '#666',
                        marginBottom: '8px',
                      }}
                    >
                      📍 Custom Location Mode
                    </p>
                    <p style={{ fontSize: '14px', color: '#999' }}>
                      Map disabled when using custom locations.
                      <br />
                      Enter location names in the form.
                    </p>
                  </div>
                </div>
              ) : (
                <RequestRideMap
                  pickupLocation={safePickup}
                  dropoffLocation={safeDropoff}
                  availableLocations={getAvailableLocations()}
                  onPickupSelect={handleLocationSelect}
                  onDropoffSelect={handleLocationSelect}
                />
              )}
            </div>
          </div>
        </APIProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
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
