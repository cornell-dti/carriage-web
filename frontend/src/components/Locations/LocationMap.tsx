import React, { useCallback, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { Marker } from '@googlemaps/markerclusterer';
import { OpenInFull } from '@mui/icons-material';
import styles from './locations.module.css';
import { Location } from 'types';

interface LocationMapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location | null) => void;
  onViewDetails: (location: Location) => void;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Accept only real, finite numbers (rules out undefined, null, NaN, "") */
const isValidCoord = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

/* -------------------------------------------------------------------------- */
/* Internal map component (needs access to `useMap`)                           */
/* -------------------------------------------------------------------------- */
const MapContent = ({
  locations,
  selectedLocation,
  onLocationSelect,
  onViewDetails,
}: LocationMapProps) => {
  const map = useMap();

  /* Marker-cluster plumbing ------------------------------------------------- */
  const clusterer = useRef<MarkerClusterer | null>(null);
  const markers = useRef<Record<string, Marker>>({});

  useEffect(() => {
    if (!map || clusterer.current) return;

    clusterer.current = new MarkerClusterer({ map });

    return () => {
      clusterer.current?.clearMarkers();
      clusterer.current = null;
    };
  }, [map]);

  const handleMarkerRef = useCallback((marker: Marker | null, id: string) => {
    if (marker) markers.current[id] = marker;
    else delete markers.current[id];

    // refresh after React flushes DOM updates
    setTimeout(() => {
      clusterer.current?.clearMarkers();
      clusterer.current?.addMarkers(Object.values(markers.current));
    }, 0);
  }, []);

  /* Zoom / pan to the currently selected location -------------------------- */
  useEffect(() => {
    if (map && selectedLocation) {
      map.setZoom(15);
      map.panTo({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    }
  }, [map, selectedLocation]);

  /* ------------------------------------------------------------------------ */
  return (
    <Map
      defaultZoom={13}
      defaultCenter={{ lat: 42.4534531, lng: -76.4760776 }}
      mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
      className={styles.mapPlaceholder}
      gestureHandling="greedy"
      disableDefaultUI={false}
    >
      {/* --------------------------- Markers -------------------------------- */}
      {locations
        .filter(({ lat, lng }) => isValidCoord(lat) && isValidCoord(lng))
        .map((loc) => (
          <AdvancedMarker
            key={loc.id}
            position={{ lat: loc.lat, lng: loc.lng }} // safe values
            onClick={() =>
              onLocationSelect(selectedLocation?.id === loc.id ? null : loc)
            }
            ref={(marker) => handleMarkerRef(marker, loc.id.toString())}
            clickable
          >
            <Pin
              background={
                selectedLocation?.id === loc.id ? '#1976d2' : '#FBBC04'
              }
              glyphColor="#000"
              borderColor="#000"
              scale={1.2}
            />
          </AdvancedMarker>
        ))}

      {/* --------------------------- InfoWindow ----------------------------- */}
      {selectedLocation && (
        <InfoWindow
          position={{
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
          }}
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
                  '&:hover': { color: 'primary.main' },
                }}
              />
            </div>
          </div>
        </InfoWindow>
      )}
    </Map>
  );
};

/* -------------------------------------------------------------------------- */
/* Public wrapper (supplies the API key)                                      */
/* -------------------------------------------------------------------------- */
export const LocationMap: React.FC<LocationMapProps> = (props) => (
  <APIProvider
    apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string}
    libraries={['places']}
  >
    <MapContent {...props} />
  </APIProvider>
);

export default LocationMap;
