import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Typography,
  IconButton,
  Chip,
  Box,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import PlaceIcon from '@mui/icons-material/Place';
import { APIProvider, Map, AdvancedMarker, Pin, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { RideType, Location } from '../../types';
import styles from './RideLocations.module.css';

interface RideLocationsProps {
  ride: RideType;
}

interface LocationBlockProps {
  location: Location;
  label: string;
  icon: React.ReactNode;
  isPickup?: boolean;
}

const LocationBlock: React.FC<LocationBlockProps> = ({ location, label, icon, isPickup = false }) => {
  const handleCopyAddress = () => {
    if (location.address) {
      navigator.clipboard.writeText(location.address);
    }
  };

  return (
    <div className={styles.locationBlock}>
      <div className={styles.locationHeader}>
        {icon}
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
      </div>
      <div className={styles.locationCard}>
        <div className={styles.locationCardHeader}>
          <div className={styles.locationInfo}>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
              {location.name}
            </Typography>
            {location.address && (
              <Typography variant="body2" color="textSecondary">
                {location.address}
              </Typography>
            )}
            {location.info && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
                {location.info}
              </Typography>
            )}
            {location.tag && (
              <div className={styles.locationTag}>
                <Chip 
                  label={location.tag} 
                  size="small" 
                  variant="outlined"
                  color={isPickup ? "primary" : "secondary"}
                />
              </div>
            )}
          </div>
          {location.address && (
            <IconButton 
              size="small" 
              onClick={handleCopyAddress} 
              title="Copy address"
              className={styles.copyButton}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
};

// Fallback function to calculate approximate distance using Haversine formula
const getApproximateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
};

interface RideMapProps {
  startLocation: Location;
  endLocation: Location;
}

const RideMap: React.FC<RideMapProps> = ({ startLocation, endLocation }) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [tripInfo, setTripInfo] = useState<{ distance: string; duration: string } | null>(null);
  const mapsLibrary = useMapsLibrary('routes');

  const fetchAndDrawRoute = useCallback(async () => {
    if (!window.google || !map || !startLocation || !endLocation) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin: { lat: startLocation.lat, lng: startLocation.lng },
        destination: { lat: endLocation.lat, lng: endLocation.lng },
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
        
        // Set trip info from route result
        const leg = result.routes[0]?.legs?.[0];
        if (leg) {
          setTripInfo({
            distance: leg.distance?.text || '',
            duration: leg.duration?.text || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      // Fallback to approximate calculation
      const distance = getApproximateDistance(
        startLocation.lat,
        startLocation.lng,
        endLocation.lat,
        endLocation.lng
      );
      setTripInfo({
        distance: `${distance} mi`,
        duration: `${Math.round(distance * 2)} min`,
      });
    }
  }, [map, startLocation, endLocation]);

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
    if (startLocation && endLocation) {
      return {
        lat: (startLocation.lat + endLocation.lat) / 2,
        lng: (startLocation.lng + endLocation.lng) / 2,
      };
    }
    return { lat: 42.4534531, lng: -76.4760776 };
  };

  return (
    <>
      {/* Map */}
      <div className={styles.mapContainer}>
        <Map
          defaultZoom={13}
          defaultCenter={getMapCenter()}
          mapId={process.env.REACT_APP_GOOGLE_MAPS_MAP_ID}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {/* Pickup Location Marker */}
          <AdvancedMarker
            position={{ lat: startLocation.lat, lng: startLocation.lng }}
            clickable={true}
          >
            <Pin
              background={'#1976d2'}
              glyphColor="#fff"
              borderColor="#1976d2"
              scale={1.2}
            />
          </AdvancedMarker>

          {/* Dropoff Location Marker */}
          <AdvancedMarker
            position={{ lat: endLocation.lat, lng: endLocation.lng }}
            clickable={true}
          >
            <Pin
              background={'#4caf50'}
              glyphColor="#fff"
              borderColor="#4caf50"
              scale={1.2}
            />
          </AdvancedMarker>
        </Map>
      </div>

      {/* Distance and Time */}
      {tripInfo && (tripInfo.distance || tripInfo.duration) && (
        <div className={styles.tripInfo}>
          <div className={styles.tripInfoGrid}>
            {tripInfo.distance && (
              <div className={styles.tripInfoItem}>
                <DirectionsCarIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Distance
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {tripInfo.distance}
                  </Typography>
                </Box>
              </div>
            )}
            {tripInfo.duration && (
              <div className={styles.tripInfoItem}>
                <TimelapseIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Duration
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {tripInfo.duration}
                  </Typography>
                </Box>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const RideMapWithProvider: React.FC<RideMapProps> = (props) => (
  <APIProvider
    apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string}
    libraries={['places']}
  >
    <RideMap {...props} />
  </APIProvider>
);

const RideLocations: React.FC<RideLocationsProps> = ({ ride }) => {
  return (
    <div className={styles.container}>
      <div className={styles.locationsGrid}>
        {/* Left side - Address blocks */}
        <div>
          <LocationBlock
            location={ride.startLocation}
            label="Pickup Location"
            icon={<PlaceIcon color="primary" />}
            isPickup={true}
          />
          <LocationBlock
            location={ride.endLocation}
            label="Dropoff Location"
            icon={<PlaceIcon color="secondary" />}
            isPickup={false}
          />
        </div>

        {/* Right side - Map */}
        <div>
          <RideMapWithProvider
            startLocation={ride.startLocation}
            endLocation={ride.endLocation}
          />
        </div>
      </div>
    </div>
  );
};

export default RideLocations;