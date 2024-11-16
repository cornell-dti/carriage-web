import React, { useCallback, useEffect } from 'react';
import { Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import styles from './locations.module.css';

// TODO : Move interface description into the index.ts and import cleaner code = better code
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
  onLocationSelect: (location: Location) => void;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  locations,
  selectedLocation,
  onLocationSelect,
}) => {
  const map = useMap();

  const handleMarkerClick = useCallback(
    (location: Location): void => {
      onLocationSelect(location);
    },
    [onLocationSelect]
  );

  // Check if a location is within the current viewport
  const isLocationInBounds = useCallback(
    (map: google.maps.Map, location: Location): boolean => {
      const bounds = map.getBounds();
      if (!bounds) return false;
      return bounds.contains({ lat: location.lat, lng: location.lng });
    },
    []
  );

  // Simple animation based on whether location is in bounds or not
  const animateToLocation = useCallback(
    (map: google.maps.Map, location: Location): void => {
      const isInBounds = isLocationInBounds(map, location);
      const targetPosition: google.maps.LatLngLiteral = {
        lat: location.lat,
        lng: location.lng,
      };
      const defaultZoom = 13;

      if (!isInBounds) {
        // If out of bounds, zoom out first then pan
        map.setZoom(11); // Zoom out
        setTimeout(() => {
          map.panTo(targetPosition);
          setTimeout(() => {
            map.setZoom(defaultZoom);
          }, 300);
        }, 300);
      } else {
        map.panTo(targetPosition);
      }
    },
    [isLocationInBounds]
  );

  useEffect(() => {
    if (map && selectedLocation) {
      animateToLocation(map, selectedLocation);
    }
  }, [map, selectedLocation, animateToLocation]);

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
    </Map>
  );
};
