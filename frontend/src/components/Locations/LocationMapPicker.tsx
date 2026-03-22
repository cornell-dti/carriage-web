import React, { useState, useCallback, useEffect } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { Dialog, Button, Typography } from '@mui/material';
import styles from './locations.module.css';

interface LocationPosition {
  lat: number;
  lng: number;
}

interface LocationPickerMapProps {
  onPointSelected: (lat: number, lng: number) => void;
  initialPosition?: LocationPosition;
  onGetAddress?: (lat: number, lng: number) => void;
}

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  onPointSelected,
  initialPosition,
  onGetAddress,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<LocationPosition | null>(
    null
  );
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    if (initialPosition && initialPosition.lat && initialPosition.lng) {
      setSelectedPoint(initialPosition);
    }
  }, [initialPosition]);

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      if (!event.detail?.latLng) return;
      const { lat, lng } = event.detail.latLng;

      setSelectedPoint({ lat, lng });

      if (onGetAddress) {
        onGetAddress(lat, lng);
      }

      setConfirmDialogOpen(true);
    },
    [onGetAddress]
  );

  const handleConfirmPoint = () => {
    if (selectedPoint) {
      onPointSelected(selectedPoint.lat, selectedPoint.lng);
      setConfirmDialogOpen(false);
    }
  };

  const defaultCenter =
    initialPosition && initialPosition.lat && initialPosition.lng
      ? initialPosition
      : { lat: 42.4534531, lng: -76.4760776 };

  return (
    <>
      <Map
        defaultZoom={initialPosition ? 15 : 13}
        defaultCenter={defaultCenter}
        mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
        className={styles.mapContainer}
        gestureHandling="greedy"
        disableDefaultUI={false}
        onClick={handleMapClick}
      >
        {selectedPoint && (
          <AdvancedMarker position={selectedPoint} clickable={false}>
            <Pin />
          </AdvancedMarker>
        )}
      </Map>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <div className={styles.confirmDialog}>
          <Typography className={styles.confirmDialogTitle}>
            Confirm Location
          </Typography>
          <Typography>Do you want to confirm this point?</Typography>
          <div className={styles.confirmDialogActions}>
            <Button onClick={handleConfirmPoint} color="primary">
              Confirm
            </Button>
            <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default LocationPickerMap;
