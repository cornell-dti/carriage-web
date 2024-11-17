import React, { useCallback, useEffect, useState } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { Button, Chip } from '@mui/material';
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

interface LocationMapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location | null) => void;
  onViewDetails: (location: Location) => void;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  locations,
  selectedLocation,
  onLocationSelect,
  onViewDetails,
}) => {
  const map = useMap();
  const [markerWithPopup, setMarkerWithPopup] = useState<Location | null>(null);

  const handleMarkerClick = useCallback(
    (location: Location): void => {
      if (markerWithPopup?.id === location.id) {
        // If clicking the same marker, close popup
        setMarkerWithPopup(null);
        onLocationSelect(null);
      } else {
        // If clicking a new marker, show its popup
        setMarkerWithPopup(location);
        onLocationSelect(location);
      }
    },
    [markerWithPopup, onLocationSelect]
  );

  // Center map on selection (from either list or marker)
  useEffect(() => {
    if (map && selectedLocation) {
      map.panTo({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    }
  }, [map, selectedLocation]);

  // Close popup when selection is cleared
  useEffect(() => {
    if (!selectedLocation) {
      setMarkerWithPopup(null);
    }
  }, [selectedLocation]);

  return (
    <Map
      defaultZoom={13}
      defaultCenter={{ lat: 42.4534531, lng: -76.4760776 }}
      mapId={process.env.REACT_APP_GOOGLE_MAPS_MAP_ID}
      className={styles.mapPlaceholder}
      gestureHandling={'greedy'}
      disableDefaultUI={false}
    >
      {locations.map((location) => (
        <AdvancedMarker
          key={location.id}
          position={{ lat: location.lat, lng: location.lng }}
          onClick={() => handleMarkerClick(location)}
          clickable={true}
        >
          <Pin
            background={
              selectedLocation?.id === location.id ? '#1976d2' : '#FBBC04'
            }
            glyphColor="#000"
            borderColor="#000"
            scale={1.2}
          />
        </AdvancedMarker>
      ))}

      {markerWithPopup && (
        <InfoWindow
          position={{
            lat: markerWithPopup.lat + 0.005,
            lng: markerWithPopup.lng,
          }}
          onCloseClick={() => {
            setMarkerWithPopup(null);
            onLocationSelect(null);
          }}
        >
          <div className={styles.mapPopup}>
            <h4>{markerWithPopup.name}</h4>
            <Chip label={markerWithPopup.tag} size="small" sx={{ mb: 1 }} />
            <p>{markerWithPopup.address}</p>
            <Button
              size="small"
              variant="contained"
              onClick={() => onViewDetails(markerWithPopup)}
              sx={{ mt: 1 }}
            >
              View Details
            </Button>
          </div>
        </InfoWindow>
      )}
    </Map>
  );
};
