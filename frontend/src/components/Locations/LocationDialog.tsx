import React from 'react';
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
import styles from './locations.module.css';

interface Location {
  id: number;
  name: string;
  address: string;
  info: string;
  tag: string;
  lat: number;
  lng: number;
}

interface LocationDialogProps {
  location: Location | null;
  onClose: () => void;
}

const LocationDialog: React.FC<LocationDialogProps> = ({
  location,
  onClose,
}) => {
  if (!location) return null;

  return (
    <Modal
      open={!!location}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
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
      >
        {/* Close button */}
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

        {/* Title and tag */}
        <Box sx={{ mb: 3, pr: 4 }}>
          <Typography variant="h5" component="h2">
            {location.name}
          </Typography>
          <Chip label={location.tag} size="small" sx={{ mt: 1 }} />
        </Box>

        {/* Content */}
        <div className={styles.dialogContent}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Address
          </Typography>
          <Typography sx={{ mb: 2 }}>{location.address}</Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Information
          </Typography>
          <Typography>{location.info}</Typography>
        </div>

        {/* Actions */}
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button onClick={onClose}>Close</Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default LocationDialog;
