import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Stack,
  Box,
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
import RequestRideMap from './RequestRideMap';
import styles from './requestridedialog.module.css';
import { PlacesSearch } from '../../components/Locations/PlacesSearch';

type RepeatOption = 'none' | 'daily' | 'weekly' | 'custom';

interface Location {
  id: number;
  name: string;
  address: string;
  info: string;
  tag: string;
  lat: number;
  lng: number;
}

export interface FormData {
  pickupLocation: {
    address: string;
    lat: number;
    lng: number;
  } | null;
  dropoffLocation: Location | null;
  date: Date | null;
  time: Date | null;
  repeatType: RepeatOption;
  repeatEndDate: Date | null;
  selectedDays: string[];
}

interface RequestRideDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  supportedLocations: Location[];
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

const RequestRideDialog: React.FC<RequestRideDialogProps> = ({
  open,
  onClose,
  onSubmit,
  supportedLocations,
}) => {
  const [formData, setFormData] = useState<FormData>({
    pickupLocation: null,
    dropoffLocation: null,
    date: null,
    time: null,
    repeatType: 'none',
    repeatEndDate: null,
    selectedDays: [],
  });

  useEffect(() => {
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
    }
  }, [open]);

  const handlePickupSelect = (address: string, lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      pickupLocation: { address, lat, lng },
    }));
  };

  const handleDropoffChange = (event: SelectChangeEvent<number>) => {
    const locationId = event.target.value as number;
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

  const handleSubmit = () => {
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Request a Ride</DialogTitle>
      <DialogContent>
        <Stack
          direction="row"
          spacing={3}
          sx={{ width: '100%', height: '600px' }}
        >
          <Box sx={{ flex: 7 }}>
            <Stack spacing={2} className={styles.formSection}>
              <div>
                <label className={styles.fieldLabel}>Pickup Location</label>
                <PlacesSearch onAddressSelect={handlePickupSelect} />
              </div>

              <FormControl fullWidth>
                <InputLabel>Drop-off Location</InputLabel>
                <Select<number>
                  value={formData.dropoffLocation?.id || ''}
                  onChange={handleDropoffChange}
                  label="Drop-off Location"
                >
                  {supportedLocations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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
                <Box>
                  <FormLabel component="legend" sx={{ mb: 1 }}>
                    Select Days
                  </FormLabel>
                  <ToggleButtonGroup
                    value={formData.selectedDays.map(getShortDay)}
                    onChange={handleDaysChange}
                    aria-label="select days"
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                      '& .MuiToggleButton-root': {
                        flex: '1 0 auto',
                        minWidth: '48px',
                        bgcolor: 'background.paper',
                        borderRadius: '4px !important',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                        },
                      },
                    }}
                  >
                    {daysOfWeek.map((day) => (
                      <ToggleButton
                        key={day}
                        value={day}
                        aria-label={fullDayNames[day]}
                      >
                        {day}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>
              )}
            </Stack>
          </Box>
          <Box sx={{ flex: 5 }} className={styles.mapSection}>
            <RequestRideMap
              pickupLocation={
                formData.pickupLocation
                  ? {
                      lat: formData.pickupLocation.lat,
                      lng: formData.pickupLocation.lng,
                      name: formData.pickupLocation.address,
                      address: formData.pickupLocation.address,
                      type: 'pickup',
                    }
                  : null
              }
              dropoffLocation={
                formData.dropoffLocation
                  ? {
                      lat: formData.dropoffLocation.lat,
                      lng: formData.dropoffLocation.lng,
                      name: formData.dropoffLocation.name,
                      address: formData.dropoffLocation.address,
                      type: 'dropoff',
                    }
                  : null
              }
              onPickupSelect={() => {}}
              onDropoffSelect={() => {}}
            />
          </Box>
        </Stack>
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
    </Dialog>
  );
};

export default RequestRideDialog;
