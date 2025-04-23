import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { Marker } from '@googlemaps/markerclusterer';
import styles from './locations.module.css';
import { OpenInFull } from '@mui/icons-material';

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
  const clusterer = useRef<MarkerClusterer | null>(null);
  const markers = useRef<Record<string, Marker>>({});

  // Initialize clusterer once when map is available
  useEffect(() => {
    if (!map || clusterer.current) return;
    clusterer.current = new MarkerClusterer({ map });
    return () => {
      if (clusterer.current) {
        clusterer.current.clearMarkers();
        clusterer.current = null;
      }
    };
  }, [map]);

  // Handle marker references and clusterer updates
  const handleMarkerRef = useCallback(
    (marker: Marker | null, locationId: string) => {
      if (marker) {
        markers.current[locationId] = marker;
      } else {
        delete markers.current[locationId];
      }

      // Schedule cluster update after React's DOM updates
      setTimeout(() => {
        if (clusterer.current) {
          clusterer.current.clearMarkers();
          clusterer.current.addMarkers(Object.values(markers.current));
        }
      }, 0);
    },
    []
  );

  useEffect(() => {
    if (map && selectedLocation) {
      map.setZoom(15);
      map.panTo({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    }
  }, [map, selectedLocation]);

  return (
    <Map
      defaultZoom={13}
      defaultCenter={{ lat: 42.4534531, lng: -76.4760776 }}
      mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
      className={styles.mapPlaceholder}
      gestureHandling={'greedy'}
      disableDefaultUI={false}
    >
      {locations.map((location) => (
        <AdvancedMarker
          key={location.id}
          position={{ lat: location.lat, lng: location.lng }}
          onClick={() =>
            onLocationSelect(
              selectedLocation?.id === location.id ? null : location
            )
          }
          clickable={true}
          ref={(marker: Marker | null) =>
            handleMarkerRef(marker, location.id.toString())
          }
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

      {selectedLocation && (
        <InfoWindow
          position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
          pixelOffset={[0, -40]}
          onCloseClick={() => onLocationSelect(null)}
        >
          <div className={styles.mapPopup}>
            <div className={styles.popupHeader}>
              <h4>{selectedLocation.shortName}</h4>
              <OpenInFull
                className={styles.expandIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(selectedLocation);
                }}
                sx={{
                  cursor: 'pointer',
                  color: 'action.active',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              />
            </div>
          </div>
        </InfoWindow>
      )}
    </Map>
  );
};
