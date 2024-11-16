import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { PlacesSearch } from './PlacesSearch';


// TODO : Move to the index.ts since it is a constant
const CAMPUS_OPTIONS = [
  'North Campus',
  'West Campus', 
  'Central Campus',
  'South Campus',
  'Commons',
  'Other'
] as const;

interface Location {
  name: string;
  address: string;
  info: string;
  tag: string;
  lat: number;
  lng: number;
}

interface AddLocationModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (location: Location) => void;
}

export const AddLocationModal: React.FC<AddLocationModalProps> = ({
  open,
  onClose,
  onAdd
}) => {
  const [newLocation, setNewLocation] = useState<Location>({
    name: '',
    address: '',
    info: '',
    tag: 'Other',
    lat: 0,
    lng: 0
  });

  const [errors, setErrors] = useState({
    name: '',
    info: ''
  });

  useEffect(() => {
    if (!open) {
      setNewLocation({
        name: '',
        address: '',
        info: '',
        tag: 'Other',
        lat: 0,
        lng: 0
      });
      setErrors({
        name: '',
        info: ''
      });
    }
  }, [open]);

  const handleAddressSelect = (address: string, lat: number, lng: number) => {
    console.log('Address selected:', { address, lat, lng });
    setNewLocation(prev => ({
      ...prev,
      address,
      lat,
      lng
    }));
  };

  const validateName = (name: string) => {
    if (!name) {
      return 'Location name is required';
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
      return 'Only alphanumeric characters and spaces allowed';
    }
    return '';
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const error = validateName(name);
    setErrors(prev => ({ ...prev, name: error }));
    setNewLocation(prev => ({ ...prev, name }));
  };

  const handleSubmit = () => {
    const nameError = validateName(newLocation.name);
    const infoError = !newLocation.info ? 'Description is required' : '';

    setErrors({
      name: nameError,
      info: infoError
    });

    if (!nameError && !infoError && newLocation.address && newLocation.lat && newLocation.lng) {
      console.log('Submitting location:', newLocation);
      onAdd(newLocation);
      onClose();
    }
  };

  const handleClose = () => {
    console.log('Closing modal');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Location</DialogTitle>
      <DialogContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <TextField
            label="Location Name"
            fullWidth
            value={newLocation.name}
            onChange={handleNameChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(0, 0, 0, 0.6)' }}>
              Address
            </label>
            <PlacesSearch onAddressSelect={handleAddressSelect} />
          </div>
          
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newLocation.info}
            onChange={(e) => {
              const info = e.target.value;
              setErrors(prev => ({ ...prev, info: info ? '' : 'Description is required' }));
              setNewLocation(prev => ({ ...prev, info }));
            }}
            error={!!errors.info}
            helperText={errors.info}
          />

          <FormControl fullWidth>
            <InputLabel>Campus</InputLabel>
            <Select
              value={newLocation.tag}
              label="Campus"
              onChange={(e) => setNewLocation(prev => ({ 
                ...prev, 
                tag: e.target.value 
              }))}
            >
              {CAMPUS_OPTIONS.map((campus) => (
                <MenuItem key={campus} value={campus}>
                  {campus}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained" 
          color="primary"
          disabled={!newLocation.name || !newLocation.address || !newLocation.info || !newLocation.lat || !newLocation.lng}
        >
          Add Location
        </Button>
      </DialogActions>
    </Dialog>
  );
};