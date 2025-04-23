import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';

import { Location, Tag } from 'types';
import { APIProvider } from '@vis.gl/react-google-maps';
import styles from './locations.module.css';
import LocationPickerMap from './LocationMapPicker';
import PlacesSearch from './PlacesSearch';
import GeocoderService from './GeocoderService';


const CAMPUS_OPTIONS = [
  'North Campus',
  'West Campus',
  'Central Campus',
  'South Campus',
  'Commons',
  'Other',
] as const;

interface LocationFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (location: Location) => void;
  initialData?: Location;
  mode: 'add' | 'edit';
}

export const LocationFormModal = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
}: LocationFormModalProps) => {

  const [formData, setFormData] = useState<Location>({
    id: initialData?.id ?? '',
    name: initialData?.name || '',
    address: initialData?.address || '',
    shortName: initialData?.shortName || '',
    info: initialData?.info || '',
    tag: initialData?.tag || Tag.WEST,
    lat: initialData?.lat || 0,
    lng: initialData?.lng || 0,
    photoLink: initialData?.photoLink || '',
  } as Location);

  const [formData, setFormData] = useState<Location>(emptyLocation);
  const [mapKey, setMapKey] = useState<number>(0);
  const [addressLoading, setAddressLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset form and force map recreation when modal opens/closes
  useEffect(() => {
    if (open && initialData && mode === 'edit') {
      setFormData(initialData);
    } else if (!open) {
      setFormData({
        id: '',
        name: '',
        address: '',
        shortName: '',
        info: '',
        tag: Tag.WEST,
        lat: 0,
        lng: 0,
        photoLink: '',
      });

    }
  }, [open, initialData, mode]);

  // Handle when a point is selected on the map
  const handlePointSelected = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      lat,
      lng,
    }));
  };

  // Get address from a map click
  const handleGetAddressFromMap = async (lat: number, lng: number) => {
    setAddressLoading(true);
    try {
      const address = await GeocoderService.getAddressFromCoordinates(lat, lng);
      setFormData((prev) => ({
        ...prev,
        address,
        lat,
        lng,
      }));
    } catch (error) {
      setErrorMessage("Couldn't retrieve address for this location");
      console.error('Error getting address:', error);
    } finally {
      setAddressLoading(false);
    }
  };

  // Handle when an address is selected from search
  const handleAddressSelect = (address: string, lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      address,
      lat,
      lng,
    }));
  };

  // Handle when the address field changes manually
  const handleAddressChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: value,
    }));
  };

  // Handle geocoding when user enters an address and wants to locate it on map
  const handleLocateAddress = async () => {
    if (!formData.address) return;

    setAddressLoading(true);
    try {
      const coords = await GeocoderService.getCoordinatesFromAddress(
        formData.address
      );
      setFormData((prev) => ({
        ...prev,
        lat: coords.lat,
        lng: coords.lng,
      }));
    } catch (error) {
      setErrorMessage("Couldn't find coordinates for this address");
      console.error('Error geocoding address:', error);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {mode === 'add' ? 'Add New Location' : 'Edit Location'}
      </DialogTitle>
      <DialogContent>
        <APIProvider
          apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string}
          libraries={['places']}
        >
          <div className={styles.formGrid}>
            {/* Form Column */}
            <div className={styles.formColumn}>
              <TextField
                label="Location Name"
                fullWidth
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />

              <TextField
                label="Short Name"
                fullWidth
                value={formData.shortName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    shortName: e.target.value,
                  }))
                }
                helperText="A shorter display name for the location (e.g., RPCC)"
              />

              <FormControl fullWidth>
                <InputLabel>Campus</InputLabel>
                <Select
                  value={formData.tag}
                  label="Campus"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tag: e.target.value as string,
                    }))
                  }
                >
                  {CAMPUS_OPTIONS.map((campus) => (
                    <MenuItem key={campus} value={campus}>
                      {campus}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.info}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, info: e.target.value }))
                }
              />

              <div className={styles.addressSection}>
                <Typography className={styles.addressTitle}>Address</Typography>

                <PlacesSearch
                  onAddressSelect={handleAddressSelect}
                  value={formData.address}
                  onChange={handleAddressChange}
                />

                <div className={styles.addressTools}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleLocateAddress}
                    disabled={!formData.address || addressLoading}
                  >
                    Locate on Map
                  </Button>
                  {addressLoading && <CircularProgress size={20} />}
                </div>

                <Typography className={styles.coordinatesText}>
                  Current coordinates:
                  {formData.lat && formData.lng
                    ? ` ${formData.lat.toFixed(6)}, ${formData.lng.toFixed(6)}`
                    : ' None'}
                </Typography>
              </div>
            </div>
          ) : (
            <TextField
              label="Address"
              fullWidth
              value={formData.address}
              disabled
              helperText="Address cannot be edited"
            />
          )}

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.info}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, info: e.target.value }))
            }
          />

          <FormControl fullWidth>
            <InputLabel>Campus</InputLabel>
            <Select
              value={formData.tag}
              label="Campus"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  tag: e.target.value as Tag,
                }))
              }
            >
              {CAMPUS_OPTIONS.map((campus) => (
                <MenuItem key={campus} value={campus}>
                  {campus}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>


            {/* Map Column */}
            <div className={styles.formColumn}>
              <div className={styles.mapSection}>
                <LocationPickerMap
                  onPointSelected={handlePointSelected}
                  onGetAddress={handleGetAddressFromMap}
                  key={`location-picker-${mapKey}`}
                  initialPosition={
                    formData.lat && formData.lng
                      ? { lat: formData.lat, lng: formData.lng }
                      : undefined
                  }
                />
              </div>
              <Typography className={styles.infoText}>
                Click on the map to select a location and get its address
                automatically.
              </Typography>
            </div>
          </div>
        </APIProvider>

      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={
            !formData.name ||
            !formData.shortName ||
            !formData.info ||
            (mode === 'add' &&
              (!formData.lat || !formData.lng || !formData.address))

          }
        >
          {mode === 'add' ? 'Add Location' : 'Save Changes'}
        </Button>
      </DialogActions>

      {/* Error notification */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
      >
        <Alert onClose={() => setErrorMessage(null)} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default LocationFormModal;
