import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { Marker } from '@googlemaps/markerclusterer';
import styles from './requestridedialog.module.css';
// Removed unused imports
import { Location } from '../../types';

interface RequestRideMapProps {
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  dropoffOptions?: Array<{
    id?: string;
    lat: number;
    lng: number;
    name: string;
    address: string;
  }>;
  availableLocations?: Location[];
  onPickupSelect: (location: Location | null) => void;
  onDropoffSelect: (location: Location | null) => void;
}

const RequestRideMap: React.FC<RequestRideMapProps> = ({
  pickupLocation,
  dropoffLocation,
  dropoffOptions,
  availableLocations = [],
  onPickupSelect,
  onDropoffSelect,
}) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const clusterer = useRef<MarkerClusterer | null>(null);
  const markers = useRef<Record<string, Marker>>({});
  const [markerWithPopup, setMarkerWithPopup] = useState<Location | null>(null);

  // Accept only real, finite numbers
  const isValidCoord = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

  // Marker-cluster plumbing
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

  const fetchAndDrawRoute = useCallback(async () => {
    if (!window.google || !map || !pickupLocation || !dropoffLocation) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin: { lat: pickupLocation.lat, lng: pickupLocation.lng },
        destination: { lat: dropoffLocation.lat, lng: dropoffLocation.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      });

      if (result && result.routes[0]?.overview_path) {
        if (polylineRef.current) {
          polylineRef.current.setMap(null);
        }

        polylineRef.current = new google.maps.Polyline({
          path: result.routes[0].overview_path,
          geodesic: true,
          strokeColor: '#2196F3',
          strokeOpacity: 0.8,
          strokeWeight: 4,
          map: map,
        });

        const bounds = new google.maps.LatLngBounds();
        result.routes[0].overview_path.forEach((point) => {
          bounds.extend(point);
        });
        map.fitBounds(bounds);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    }
  }, [map, pickupLocation, dropoffLocation]);

  useEffect(() => {
    fetchAndDrawRoute();

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [fetchAndDrawRoute]);

  const getMapCenter = () => {
    if (pickupLocation && dropoffLocation) {
      return {
        lat: (pickupLocation.lat + dropoffLocation.lat) / 2,
        lng: (pickupLocation.lng + dropoffLocation.lng) / 2,
      };
    } else if (pickupLocation) {
      return { lat: pickupLocation.lat, lng: pickupLocation.lng };
    } else if (dropoffLocation) {
      return { lat: dropoffLocation.lat, lng: dropoffLocation.lng };
    } else {
      return { lat: 42.4534531, lng: -76.4760776 };
    }
  };

  const handleMarkerClick = (location: Location) => {
    if (markerWithPopup?.address === location.address) {
      setMarkerWithPopup(null);
    } else {
      setMarkerWithPopup(location);
    }
  };

  // Remove custom map click handling since we only use predefined locations now

  // Remove these functions since confirmation is now handled in the parent component

  return (
    <>
    <Map
      defaultZoom={13}
      defaultCenter={getMapCenter()}
      mapId={process.env.REACT_APP_GOOGLE_MAPS_MAP_ID}
      gestureHandling={'greedy'}
      disableDefaultUI={false}
      className={styles.mapContainer}
    >
      {/* Pickup Location Marker */}
      {pickupLocation && (
        <AdvancedMarker
          position={{ lat: pickupLocation.lat, lng: pickupLocation.lng }}
          onClick={() => handleMarkerClick(pickupLocation)}
          clickable={true}
        >
          <Pin
            background={'#1976d2'}
            glyphColor="#fff"
            borderColor="#1976d2"
            scale={1.2}
          />
        </AdvancedMarker>
      )}


      {/* Available Locations for Dropoff Selection */}
      {availableLocations
        .filter((loc) => isValidCoord(loc.lat) && isValidCoord(loc.lng))
        .map((location) => (
          <AdvancedMarker
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            onClick={() => onDropoffSelect(location)}
            ref={(marker) => handleMarkerRef(marker, location.id.toString())}
            clickable={true}
          >
            <Pin
              background={dropoffLocation?.id === location.id ? '#4caf50' : '#FBBC04'}
              glyphColor={dropoffLocation?.id === location.id ? "#fff" : "#000"}
              borderColor={dropoffLocation?.id === location.id ? "#4caf50" : "#000"}
              scale={dropoffLocation?.id === location.id ? 1.2 : 1.0}
            />
          </AdvancedMarker>
        ))}

      {/* Legacy dropoffOptions support */}
      {!dropoffLocation && !availableLocations.length && Array.isArray(dropoffOptions) && dropoffOptions
        .filter(o => isValidCoord(o.lat) && isValidCoord(o.lng))
        .map((opt: { id?: number | string; lat: number; lng: number; name: string; address: string; }, idx: number) => (
          <AdvancedMarker
            key={`${opt.id ?? idx}-${opt.lat}-${opt.lng}`}
            position={{ lat: opt.lat, lng: opt.lng }}
            onClick={() => onDropoffSelect({
              id: opt.id?.toString() || 'custom',
              lat: opt.lat,
              lng: opt.lng,
              name: opt.name,
              address: opt.address,
              shortName: opt.name,
              tag: 'custom' as any,
              info: ''
            })}
            clickable={true}
          >
            <Pin background={'#4caf50'} glyphColor="#fff" borderColor="#4caf50" scale={1.0} />
          </AdvancedMarker>
        ))}

      {markerWithPopup && (
        <InfoWindow
          position={{
            lat: markerWithPopup.lat + 0.001,
            lng: markerWithPopup.lng,
          }}
          onCloseClick={() => setMarkerWithPopup(null)}
        >
          <div className={styles.mapPopup}>
            <h4>{markerWithPopup.shortName}</h4>
            <p>{markerWithPopup.name}</p>
            <p>{markerWithPopup.address}</p>
          </div>
        </InfoWindow>
      )}
    </Map>

    {/* Confirmation dialog is now handled in the parent component */}
  </>
  );
};

/* -------------------------------------------------------------------------- */
/* Public wrapper (supplies the API key)                                      */
/* -------------------------------------------------------------------------- */
const RequestRideMapWithProvider: React.FC<RequestRideMapProps> = (props) => (
  <APIProvider
    apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string}
    libraries={['places']}
  >
    <RequestRideMap {...props} />
  </APIProvider>
);

export default RequestRideMapWithProvider;
