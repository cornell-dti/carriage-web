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
import { Location } from '../../types';

interface Props {
  location: Location | null;
  onClose: () => void;
  onSave: (loc: Location) => void;
}

const LocationDialog: React.FC<Props> = ({ location, onClose, onSave }) => {
  const [edit, setEdit] = useState(false);
  const [current, setCurrent] = useState<Location | null>(null);

  useEffect(() => setCurrent(location), [location]);

  if (!location || !current) return null;

  const handleEditSave = (upd: Location) => {
    onSave(upd);
    setCurrent(upd);
    setEdit(false);
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
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ mb: 3, pr: 4 }}>
            <Typography variant="h5">{current.name}</Typography>
            <Chip label={current.tag} size="small" sx={{ mt: 1 }} />
          </Box>

          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Address
          </Typography>
          <Typography sx={{ mb: 2 }}>{current.address}</Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Information
          </Typography>
          <Typography>{current.info}</Typography>

          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              sx={{ mr: 1 }}
              onClick={() => setEdit(true)}
            >
              Edit
            </Button>
            <Button onClick={onClose}>Close</Button>
          </Box>
        </Paper>
      </Modal>

      <LocationFormModal
        open={edit}
        onClose={() => setEdit(false)}
        onSubmit={handleEditSave}
        initialData={current}
        mode="edit"
      />
    </>
  );
};

export default LocationDialog;
