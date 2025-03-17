import React, { useState, useEffect } from 'react';
import {
  Modal,
  Paper,
  IconButton,
  Button,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { LocationFormModal } from './LocationFormModal';
import styles from './locations.module.css';

interface Location {
  id: number;
  name: string;
  shortName: string;
  address: string;
  info: string;
  tag: string;
  lat: number;
  lng: number;
}

interface LocationDialogProps {
  location: Location | null;
  onClose: () => void;
  onSave: (location: Location) => void;
}

const LocationDialog: React.FC<LocationDialogProps> = ({
  location,
  onClose,
  onSave,
}) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  // Update currentLocation when location prop changes
  useEffect(() => {
    setCurrentLocation(location);
  }, [location]);

  if (!location || !currentLocation) return null;

  const handleEditSubmit = (updatedLocation: Location) => {
    onSave(updatedLocation);
    setCurrentLocation(updatedLocation);
    setIsEditMode(false);
  };

  return (
    <>
      <Modal
        open={!!location}
        onClose={onClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300,
        }}
      >
        <Paper
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto',
            p: 3,
            m: 2,
          }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ mb: 3, pr: 4 }}>
            <Typography variant="h5" component="h2">
              {currentLocation.name}
            </Typography>
            <Chip label={currentLocation.tag} size="small" sx={{ mt: 1 }} />
          </Box>

          <div className={styles.dialogContent}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Address
            </Typography>
            <Typography sx={{ mb: 2 }}>{currentLocation.address}</Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Information
            </Typography>
            <Typography>{currentLocation.info}</Typography>
          </div>

          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button
              startIcon={<EditIcon />}
              onClick={() => setIsEditMode(true)}
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button onClick={onClose}>Close</Button>
          </Box>
        </Paper>
      </Modal>

      <LocationFormModal
        open={isEditMode}
        onClose={() => setIsEditMode(false)}
        onSubmit={handleEditSubmit}
        initialData={currentLocation}
        mode="edit"
      />
    </>
  );
};

export default LocationDialog;
