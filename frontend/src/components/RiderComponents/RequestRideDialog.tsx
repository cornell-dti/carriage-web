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
import RequestRidePlacesSearch from './RequestRidePlacesSearch';
import axios from '../../util/axios';
import { error } from 'console';

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
  //official locations with other added
  const supportLocsWithOther = [Other, ...supportedLocations];

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
  const [customDroppoff, setCustomDropoff] = useState(false);
  const [inputPickUpError, setInputPickUpError] = useState(false);
  const [inputDropOffError, setInputDropOffError] = useState(false);
  const [inputErrorText, setInputErrorText] = useState('');

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

  /**
   * Finalizes  pending location selection after user confirms
   *
   * Depending on the current 'selectionState':
   *  - Saves as the pickup location or
   *  - Saves as the dropoff location
   *
   * Pprogresses the state machine to the next step.
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
  };

  const handleCancel = () => {
    // reset custom picker flags
    setCustomPickup(false);
    setCustomDropoff(false);

    // clear any inputs/error
    setInputPickUpError(false);
    setInputDropOffError(false);
    setInputErrorText('');
    resetSelection();

    // close dialog
    onClose();
  };

  // Get available locations based on current selection state
  const getAvailableLocations = () => {
    if (selectionState === 'pickup') {
      // Show all locations for pickup selection
      return supportLocsWithOther;
    } else if (selectionState === 'dropoff') {
      // Show all locations except the selected pickup location
      return supportLocsWithOther.filter(
        (loc) =>
          loc.id.startsWith('custom') || loc.id !== formData.pickupLocation?.id
      );
    } else {
      // Show only selected locations
      return [formData.pickupLocation, formData.dropoffLocation].filter(
        Boolean
      ) as Location[];
    }
  };

  const getAllLocs = async () => {
    const locationsData: Array<Location> = await axios
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
   * @returns {Promise<Location>}
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
  ): Promise<Location> => {
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
    const payload: Partial<Location> = {
      name: address.split(',')[0], // short name
      shortName: '',
      address,
      info: '',
      tag: Tag.CUSTOM,
      lat,
      lng,
    };

    const response = await axios.post('/api/locations/custom', payload); //add to locations
    const created: Location = response.data.data || response.data;
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
    try {
      let finalPickup = formData.pickupLocation;
      let finalDropoff = formData.dropoffLocation;

      // only create custom pickup if it's "Other"
      if (finalPickup?.name === Other.name) {
        const createdPickup = await createOrGetLocation(
          finalPickup.address,
          finalPickup.lat,
          finalPickup.lng,
          true //isPickUp
        );
        finalPickup = createdPickup;
      }

      // only create custom dropoff if it's "Other"
      if (finalDropoff?.name === Other.name) {
        const createdDropoff = await createOrGetLocation(
          finalDropoff.address,
          finalDropoff.lat,
          finalDropoff.lng,
          false //isPickUp
        );
        finalDropoff = createdDropoff;
      }

      //additional check to ensure pickup and dropoff addresses are different
      if (
        finalDropoff !== null &&
        finalPickup !== null &&
        normalizeAddress(finalDropoff?.address) ===
        normalizeAddress(finalPickup.address)
      ) {
        setInputPickUpError(true);
        setInputDropOffError(true);
        setInputErrorText('Start and end location are too simiilar');
        resetSelection();
        setCustomPickup(false);
        setCustomDropoff(false);
        throw new Error('Start and end location are too simiilar');
      }

      onSubmit({
        ...formData,
        pickupLocation: finalPickup,
        dropoffLocation: finalDropoff,
      });
      setCustomPickup(false);
      setCustomDropoff(false);
      onClose();
    } catch (err) {
      console.error('Error submitting ride:', err);
      alert('Failed to submit ride. Please try again.');
    }
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

  // Ensures the map only receives valid coordinates; prevents rendering issues
  const safePickup =
    formData.pickupLocation?.lat && formData.pickupLocation?.lng
      ? formData.pickupLocation
      : null;

  const safeDropoff =
    formData.dropoffLocation?.lat && formData.dropoffLocation?.lng
      ? formData.dropoffLocation
      : null;

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
                <div style={{ marginBottom: '5px' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>
                    Or select from dropdown:
                  </h4>

                  <FormControl fullWidth required style={{ marginBottom: '16px' }}>
                    <InputLabel required>Pickup Location</InputLabel>
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
                        //remove error if user changes location
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

                  {customPickup === true && (
                    <div>
                      <RequestRidePlacesSearch
                        onAddressSelect={handlePickupSelect}
                      />
                    </div>
                  )}

                  <FormControl fullWidth required>
                    <InputLabel required>Drop-off Location</InputLabel>
                    <Select<string>
                      value={formData.dropoffLocation?.id || ''}
                      disabled={!formData.pickupLocation} //makes ensuring start and end locations are different simpler
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
                        // Update selection state
                        if (selectedLocation && formData.pickupLocation) {
                          setSelectionState('complete');
                        }
                        if (selectedLocation?.name === Other.name) {
                          setCustomDropoff(true);
                        } else {
                          setCustomDropoff(false);
                        }
                        //remove error if user changes locatoin
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
                        ) // Don't show pickup location as dropoff option (except Other)
                        .map((location) => (
                          <MenuItem key={location.id} value={location.id}>
                            {location.name}
                          </MenuItem>
                        ))}
                    </Select>
                    {inputDropOffError && (
                      <FormHelperText error>{inputErrorText}</FormHelperText>
                    )}
                    {!formData.pickupLocation && (
                      <FormHelperText>
                        {'Please choose pickup location first'}
                      </FormHelperText>
                    )}
                  </FormControl>

                  {customDroppoff === true && (
                    <div style={{ marginTop: '16px' }}>
                      <RequestRidePlacesSearch
                        onAddressSelect={handleDropoffSelect}
                      />
                    </div>
                  )}
                </div>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Stack direction="row" spacing={2}>
                    <DatePicker
                      label="Date *"
                      value={formData.date}
                      onChange={handleDateChange('date')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        },
                      }}
                    />
                    <TimePicker
                      label="Time *"
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
                      label="Repeat End Date *"
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
