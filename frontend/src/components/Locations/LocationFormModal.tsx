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
  InputLabel,
} from '@mui/material';
import { PlacesSearch } from './PlacesSearch';
import UploadLocationImage from './UploadLocationImage';

const CAMPUS_OPTIONS = [
  'North Campus',
  'West Campus',
  'Central Campus',
  'South Campus',
  'Commons',
  'Other',
] as const;

interface Location {
  id: number;
  name: string;
  shortName: string;
  address: string;
  info: string;
  tag: string;
  lat: number;
  lng: number;
  photoLink?: string;
}

interface LocationFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (location: Location) => void;
  initialData?: Location; // For edit mode
  mode: 'add' | 'edit';
}

export const LocationFormModal = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
}: LocationFormModalProps) => {
  const [imageBase64, setImageBase64] = useState('');
  const [formData, setFormData] = useState<Location>({
    id: initialData?.id ?? 0,
    name: '',
    address: '',
    shortName: '',
    info: '',
    tag: 'Other',
    lat: 0,
    lng: 0,
    photoLink: '',
  });

  useEffect(() => {
    if (open && initialData && mode === 'edit') {
      setFormData(initialData);
    } else if (!open) {
      setFormData({
        id: 0,
        name: '',
        address: '',
        shortName: '',
        info: '',
        tag: 'Other',
        lat: 0,
        lng: 0,
        photoLink: '',
      });
    }
  }, [open, initialData, mode]);

  const handleAddressSelect = (address: string, lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      address,
      lat,
      lng,
    }));
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
          setFormData((prev) => ({ ...prev, photoLink: resStr as string }));
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
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === 'add' ? 'Add New Location' : 'Edit Location'}
      </DialogTitle>
      <DialogContent>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginTop: '1rem',
          }}
        >
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
              setFormData((prev) => ({ ...prev, shortName: e.target.value }))
            }
          />

          {mode === 'add' ? (
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'rgba(0, 0, 0, 0.6)',
                }}
              >
                Address
              </label>
              <PlacesSearch onAddressSelect={handleAddressSelect} />
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
                setFormData((prev) => ({ ...prev, tag: e.target.value }))
              }
            >
              {CAMPUS_OPTIONS.map((campus) => (
                <MenuItem key={campus} value={campus}>
                  {campus}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <UploadLocationImage
            imageChange={updateBase64}
            existingPhoto={formData?.photoLink}            
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={
            !formData.name ||
            !formData.info ||
            (mode === 'add' &&
              (!formData.address || !formData.lat || !formData.lng))
          }
        >
          {mode === 'add' ? 'Add Location' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
