import React, { useState } from 'react';
import { IconButton, Box } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import styles from './locations.module.css';
import { LocationImage } from './LocationImagesUpload';

interface Props {
  images: LocationImage[];
}

const ImageCarousel: React.FC<Props> = ({ images }) => {
  const [currentPage, setCurrentPage] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Current Image */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={images[currentPage].url}
          alt={`Location view ${currentPage + 1}`}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>

      {/* Navigation Arrows - only show if there's more than one image */}
      {images.length > 1 && (
        <>
          <IconButton
            sx={{
              position: 'absolute',
              left: -10,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
              boxShadow: 1,
              color: '#000',
            }}
            onClick={handlePrevious}
            size="small"
            aria-label="Previous image"
          >
            <ChevronLeftIcon fontSize="medium" />
          </IconButton>
          <IconButton
            sx={{
              position: 'absolute',
              right: -10,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
              boxShadow: 1,
              color: '#000',
            }}
            onClick={handleNext}
            size="small"
            aria-label="Next image"
          >
            <ChevronRightIcon fontSize="medium" />
          </IconButton>
        </>
      )}
    </Box>
  );
};

export default ImageCarousel;
