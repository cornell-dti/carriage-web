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
import { Location, Tag } from 'types';

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

  const handleAddressSelect = (address: string, lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      address,
      lat,
      lng,
    }));
  };

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
              (!formData.lat || !formData.lng || !formData.address))
          }
        >
          {mode === 'add' ? 'Add Location' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
