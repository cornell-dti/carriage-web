import React, { useState, useEffect } from 'react';
import {
  Modal,
  Paper,
  IconButton,
  Button,
  Typography,
  Chip,
  Box,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { LocationFormModal } from './LocationFormModal';
import { Location } from '../../types';
import PaginatedImageCarousel from './ImageCarousel';
import { LocationImage } from './LocationImagesUpload';

interface Props {
  location: (Location & { imagesList?: LocationImage[] }) | null;
  onClose: () => void;
  onSave: (loc: Location & { imagesList?: LocationImage[] }) => void;
}

const LocationDialog: React.FC<Props> = ({ location, onClose, onSave }) => {
  const [edit, setEdit] = useState(false);
  const [current, setCurrent] = useState<
    (Location & { imagesList?: LocationImage[] }) | null
  >(null);
  const [images, setImages] = useState<LocationImage[]>([]);

  useEffect(() => {
    if (location) {
      setCurrent(location);

      // Set up images for the carousel
      if (location.imagesList && location.imagesList.length > 0) {
        setImages(location.imagesList);
      } else if (location.photoLink) {
        // Handle backward compatibility with single photoLink
        setImages([{ url: location.photoLink }]);
      } else {
        setImages([]);
      }
    }
  }, [location]);

  if (!location || !current) return null;

  const handleEditSave = (upd: Location & { imagesList?: LocationImage[] }) => {
    onSave(upd);
    setCurrent(upd);

    // Update the images for the carousel
    if (upd.imagesList && upd.imagesList.length > 0) {
      setImages(upd.imagesList);
    } else if (upd.photoLink) {
      setImages([{ url: upd.photoLink }]);
    } else {
      setImages([]);
    }

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

          {/* Title */}
          <Typography variant="h5" sx={{ mb: 1, mt: 0, pr: 4 }}>
            {current.name}
          </Typography>

          {/* Tag */}
          <Box sx={{ mb: 3 }}>
            <Chip label={current.tag} size="small" />
          </Box>

          <Grid container spacing={2} sx={{ mb: 6 }}>
            {/* Left Column - Info */}
            <Grid item xs={7}>
              {/* Address */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  Address
                </Typography>
                <Typography>{current.address}</Typography>
              </Box>

              {/* Information */}
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  Information
                </Typography>
                <Typography>{current.info}</Typography>
              </Box>
            </Grid>

            {/* Right Column - Image */}
            <Grid item xs={5}>
              {images.length > 0 && (
                <Box
                  sx={{
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <PaginatedImageCarousel images={images} />
                </Box>
              )}
            </Grid>
          </Grid>

          {/* Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
