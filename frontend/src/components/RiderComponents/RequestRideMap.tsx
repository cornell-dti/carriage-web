import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import styles from './requestridedialog.module.css';

interface Location {
  lat: number;
  lng: number;
  name: string;
  address: string;
  type: 'pickup' | 'dropoff';
}

interface RequestRideMapProps {
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  onPickupSelect: (location: Location | null) => void;
  onDropoffSelect: (location: Location | null) => void;
}

const RequestRideMap: React.FC<RequestRideMapProps> = ({
  pickupLocation,
  dropoffLocation,
  onPickupSelect,
  onDropoffSelect,
}) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [markerWithPopup, setMarkerWithPopup] = useState<Location | null>(null);

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

    // Cleanup
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
      return { lat: 42.4534531, lng: -76.4760776 }; // TODO : Move this to Index.ts as a CENTER constant
    }
  };

  const handleMarkerClick = (location: Location) => {
    if (markerWithPopup?.address === location.address) {
      setMarkerWithPopup(null);
    } else {
      setMarkerWithPopup(location);
    }
  };

  return (
    <Map
      defaultZoom={13}
      center={getMapCenter()}
      mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
      gestureHandling={'greedy'}
      disableDefaultUI={false}
      className={styles.mapContainer}
    >
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

      {dropoffLocation && (
        <AdvancedMarker
          position={{ lat: dropoffLocation.lat, lng: dropoffLocation.lng }}
          onClick={() => handleMarkerClick(dropoffLocation)}
          clickable={true}
        >
          <Pin
            background={'#4caf50'}
            glyphColor="#fff"
            borderColor="#4caf50"
            scale={1.2}
          />
        </AdvancedMarker>
      )}

      {markerWithPopup && (
        <InfoWindow
          position={{
            lat: markerWithPopup.lat + 0.001,
            lng: markerWithPopup.lng,
          }}
          onCloseClick={() => setMarkerWithPopup(null)}
        >
          <div className={styles.mapPopup}>
            <h4>
              {markerWithPopup.type === 'pickup'
                ? 'Pickup Location'
                : 'Drop-off Location'}
            </h4>
            <p>{markerWithPopup.name}</p>
            <p>{markerWithPopup.address}</p>
          </div>
        </InfoWindow>
      )}
    </Map>
  );
};

export default RequestRideMap;
