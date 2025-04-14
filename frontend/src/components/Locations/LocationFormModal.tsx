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
import { APIProvider } from '@vis.gl/react-google-maps';
import LocationPickerMap from './LocationMapPicker';
import PlacesSearch from './PlacesSearch';
import GeocoderService from './GeocoderService';
import { Location, Tag } from 'types';
import styles from './locations.module.css';
import UploadLocationImage from './UploadLocationImage';

const CAMPUS_OPTIONS = [
  { value: Tag.NORTH, label: 'North Campus' },
  { value: Tag.WEST, label: 'West Campus' },
  { value: Tag.CENTRAL, label: 'Central Campus' },
  { value: Tag.EAST, label: 'East Campus' },
  { value: Tag.CTOWN, label: 'Collegetown' },
  { value: Tag.DTOWN, label: 'Downtown' },
  { value: Tag.CUSTOM, label: 'Custom' },
  { value: Tag.INACTIVE, label: 'Inactive' },
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (loc: Location) => void; // TODO : Update this to send the data to the backend
  initialData?: Location;
  mode: 'add' | 'edit';
}

export const LocationFormModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const EMPTY: Location = {
    id: '',
    name: '',
    shortName: '',
    address: '',
    info: '',
    tag: Tag.CUSTOM,
    lat: 0,
    lng: 0,
    photoLink: '',
  }


  const [form, setForm] = useState<Location>(EMPTY);
  const [mapKey, setMapKey] = useState(0);
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState('');

  useEffect(() => {
    if (!open) return;

    setMapKey((k) => k + 1);
    setForm(initialData && mode === 'edit' ? initialData : EMPTY);
    
  },[open,initialData,mode]);

  const update = (patch: Partial<Location>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const selectPoint = (lat: number, lng: number) => update({ lat, lng });

  const reverseGeocode = async (lat: number, lng: number) => {
    setLoadingAddr(true);
    try {
      const addr = await GeocoderService.getAddressFromCoordinates(lat, lng);
      update({ address: addr, lat, lng });
    } catch (e) {
      setError("Couldn't retrieve address for this location");
      console.error(e);
    } finally {
      setLoadingAddr(false);
    }
  };

  const geocodeForward = async () => {
    if (!form.address) return;
    setLoadingAddr(true);
    try {
      const { lat, lng } = await GeocoderService.getCoordinatesFromAddress(
        form.address
      );
      update({ lat, lng });
    } catch (e) {
      setError("Couldn't find coordinates for this address");
      console.error(e);
    } finally {
      setLoadingAddr(false);
    }
  };

  function updateBase64(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();

    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      const file = e.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = function () {
        let res = reader.result;
        if (res) {
          res = res.toString();
          // remove "data:image/png;base64," and "data:image/jpeg;base64,"
          const resStr = res.toString();
          const strBase64 = res.toString().substring(res.indexOf(',') + 1);
          setImageBase64(strBase64);
          setForm((prev) => ({ ...prev, photoLink: resStr as string }));
        }
      };
      reader.onerror = function (error) {
        console.log('Error reading file: ', error);
      };
    } else {
      console.log('Undefined file upload');
    }
  }

  const handleSubmit = () => {
    onSubmit(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {mode === 'add' ? 'Add New Location' : 'Edit Location'}
      </DialogTitle>

      <DialogContent>
        <APIProvider
          apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string}
          libraries={['places']}
        >
          <div className={styles.formGrid}>
            {/* -------- Left column (inputs) -------------------------------- */}
            <div className={styles.formColumn}>
              <TextField
                label="Location Name"
                fullWidth
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
              />

              <TextField
                label="Short Name"
                fullWidth
                value={form.shortName}
                onChange={(e) => update({ shortName: e.target.value })}
                helperText="A shorter display name (e.g., RPCC)"
              />

              <FormControl fullWidth>
                <InputLabel>Campus</InputLabel>
                <Select
                  value={form.tag}
                  label="Campus"
                  onChange={(e) => update({ tag: e.target.value as Tag })}
                >
                  {CAMPUS_OPTIONS.map(({ value, label }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={form.info}
                onChange={(e) => update({ info: e.target.value })}
              />

              <div className={styles.addressSection}>
                <Typography className={styles.addressTitle}>Address</Typography>

                <PlacesSearch
                  onAddressSelect={(a, lat, lng) =>
                    update({ address: a, lat, lng })
                  }
                  value={form.address}
                  onChange={(val) => update({ address: val })}
                />

                <div className={styles.addressTools}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={geocodeForward}
                    disabled={!form.address || loadingAddr}
                  >
                    Locate on Map
                  </Button>
                  {loadingAddr && <CircularProgress size={20} />}
                </div>

                <Typography className={styles.coordinatesText}>
                  Current coordinates:
                  {form.lat && form.lng
                    ? ` ${form.lat.toFixed(6)}, ${form.lng.toFixed(6)}`
                    : ' None'}
                </Typography>

                <UploadLocationImage
            imageChange={updateBase64}
            existingPhoto={formData?.photoLink}
          />
              </div>
            </div>

            {/* -------- Right column (map) ---------------------------------- */}
            <div className={styles.formColumn}>
              <div className={styles.mapSection}>
                <LocationPickerMap
                  key={`picker-${mapKey}`}
                  onPointSelected={selectPoint}
                  onGetAddress={reverseGeocode}
                  initialPosition={
                    Number.isFinite(form.lat) && Number.isFinite(form.lng)
                      ? { lat: form.lat, lng: form.lng }
                      : undefined
                  }
                />
              </div>
              <Typography className={styles.infoText}>
                Click on the map to select a location and fetch its address.
              </Typography>
            </div>
          </div>
        </APIProvider>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={
            !form.name ||
            !form.shortName ||
            !form.info ||
            !form.address ||
            !form.lat ||
            !form.lng
          }
          onClick={handleSubmit}
        >
          {mode === 'add' ? 'Add Location' : 'Save Changes'}
        </Button>
      </DialogActions>

      {/* Error toast */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default LocationFormModal;
