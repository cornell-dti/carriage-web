import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { Typography, IconButton, Chip, Box, Button, TextField } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import PlaceIcon from '@mui/icons-material/Place';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMapsLibrary,
  useMap,
  MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { RideType, Location, Tag } from '../../types';
import { useRideEdit } from './RideEditContext';
import { useLocations } from '../../context/LocationsContext';
import { SearchableType } from '../../utils/searchConfig';
import SearchPopup from './SearchPopup';
import { ENABLE_ADD_RIDE_MAPS } from '../../config/googleMaps';
import styles from './RideLocations.module.css';

interface RideLocationsProps {
  // No props needed - gets ride from context
}

interface LocationBlockProps {
  location: Location;
  label: string;
  icon: React.ReactNode;
  isPickup?: boolean;
  isChanging?: boolean;
  onChangeClick?: () => void;
  canEdit?: boolean;
  dropdownButtonRef?: React.RefObject<HTMLButtonElement>;
}

const LocationBlock: React.FC<LocationBlockProps> = ({
  location,
  label,
  icon,
  isPickup = false,
  isChanging = false,
  onChangeClick,
  canEdit = false,
  dropdownButtonRef,
}) => {
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
      <div
        className={`${styles.locationCard} ${
          isChanging ? styles.locationCardChanging : ''
        }`}
        style={
          isChanging
            ? {
                border: '2px solid',
                borderColor: isPickup ? '#1976d2' : '#9c27b0',
                borderRadius: '8px',
              }
            : {}
        }
      >
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
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 0.5, fontSize: '0.85rem' }}
              >
                {location.info}
              </Typography>
            )}
            {location.tag && (
              <div className={styles.locationTag}>
                <Chip
                  label={location.tag}
                  size="small"
                  variant="outlined"
                  color={isPickup ? 'primary' : 'secondary'}
                />
              </div>
            )}
          </div>
          <div className={styles.locationActions}>
            {!isChanging && location.address && (
              <IconButton
                size="small"
                onClick={handleCopyAddress}
                title="Copy address"
                className={styles.copyButton}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            )}
            {canEdit && (
              <Button
                ref={dropdownButtonRef}
                variant={isChanging ? 'contained' : 'outlined'}
                size="small"
                onClick={onChangeClick}
                sx={{ ml: 1 }}
              >
                Change
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Fallback function to calculate approximate distance using Haversine formula
const getApproximateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
};

interface RideMapProps {
  startLocation: Location;
  endLocation: Location;
  isSelecting?: boolean;
  availableLocations?: Location[];
  onLocationSelect?: (location: Location) => void;
  changingLocationType?: 'pickup' | 'dropoff' | null;
}

const RideMap: React.FC<RideMapProps> = ({
  startLocation,
  endLocation,
  isSelecting = false,
  availableLocations = [],
  onLocationSelect,
  changingLocationType = null,
}) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [tripInfo, setTripInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const mapsLibrary = useMapsLibrary('routes');

  // Check if either location is a custom location
  const hasCustomLocation = useMemo(() => {
    const isPickupCustom =
      startLocation.tag === Tag.CUSTOM ||
      startLocation.lat === 0 ||
      startLocation.lng === 0 ||
      !startLocation.address;
    const isDropoffCustom =
      endLocation.tag === Tag.CUSTOM ||
      endLocation.lat === 0 ||
      endLocation.lng === 0 ||
      !endLocation.address;
    return isPickupCustom || isDropoffCustom;
  }, [startLocation, endLocation]);

  const fetchAndDrawRoute = useCallback(async () => {
    // Skip route fetching for custom locations
    if (hasCustomLocation) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      setTripInfo(null);
      return;
    }

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
        // Fit bounds with padding so markers/route aren't at the very edge
        // and cap the zoom so it doesn't zoom in too much
        try {
          // @ts-ignore - allow padding object per Maps JS API
          map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
        } catch {
          map.fitBounds(bounds);
        }
        // Cap the zoom after fitting bounds
        const maxZoom = 15;
        const currentZoom = map.getZoom();
        if (typeof currentZoom === 'number' && currentZoom > maxZoom) {
          map.setZoom(maxZoom);
        }

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
      // only do  approximate calculation if we have valid coordinates
      if (
        startLocation.lat !== 0 &&
        startLocation.lng !== 0 &&
        endLocation.lat !== 0 &&
        endLocation.lng !== 0
      ) {
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
    }
  }, [map, startLocation, endLocation, hasCustomLocation]);

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
    if (startLocation && endLocation && !hasCustomLocation) {
      return {
        lat: (startLocation.lat + endLocation.lat) / 2,
        lng: (startLocation.lng + endLocation.lng) / 2,
      };
    }
    return { lat: 42.4534531, lng: -76.4760776 };
  };

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      if (isSelecting && onLocationSelect && event.detail.latLng) {
        const { lat, lng } = event.detail.latLng;
        // Create a custom location from map click
        const customLocation: Location = {
          id: `custom-${Date.now()}`,
          name: 'Custom Location',
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          lat,
          lng,
          shortName: 'Custom',
          tag: Tag.CUSTOM,
          info: 'Selected on map',
        };
        onLocationSelect(customLocation);
      }
    },
    [isSelecting, onLocationSelect]
  );

  // if custom location, show placeholder instead of map
  if (hasCustomLocation) {
    return (
      <div className={styles.mapContainer}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            minHeight: '400px',
          }}
        >
          <div>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '8px' }}>
              📍 Custom Location
            </p>
            <p style={{ fontSize: '14px', color: '#999' }}>
              Map not available for custom locations
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Map */}
      <div className={styles.mapContainer}>
        <Map
          defaultZoom={12}
          defaultCenter={getMapCenter()}
          mapId={process.env.REACT_APP_GOOGLE_MAPS_MAP_ID}
          gestureHandling="greedy"
          disableDefaultUI={false}
          onClick={handleMapClick}
          // Map options for more controlled zooming
          // @ts-ignore - pass through to Google Maps options
          options={{
            minZoom: 10,
            maxZoom: 18,
          }}
        >
          {/* Always show pickup marker */}
          <AdvancedMarker
            position={{ lat: startLocation.lat, lng: startLocation.lng }}
            clickable={true}
          >
            <Pin
              background={'#1976d2'} // Blue for pickup
              glyphColor="#fff"
              borderColor="#1976d2"
              scale={1.2}
            />
          </AdvancedMarker>

          {/* Always show dropoff marker */}
          <AdvancedMarker
            position={{ lat: endLocation.lat, lng: endLocation.lng }}
            clickable={true}
          >
            <Pin
              background={'#9c27b0'} // Purple for dropoff
              glyphColor="#fff"
              borderColor="#9c27b0"
              scale={1.2}
            />
          </AdvancedMarker>

          {/* Show available location markers when selecting */}
          {isSelecting &&
            availableLocations.map((location) => {
              // Use pickup or dropoff color based on what we're changing
              const markerColor =
                changingLocationType === 'pickup' ? '#1976d2' : '#9c27b0';

              return (
                <AdvancedMarker
                  key={location.id}
                  position={{ lat: location.lat, lng: location.lng }}
                  onClick={() => onLocationSelect?.(location)}
                  clickable={true}
                >
                  <Pin
                    background={markerColor}
                    glyphColor="#fff"
                    borderColor={markerColor}
                    scale={1.0}
                  />
                </AdvancedMarker>
              );
            })}
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

const RideLocations: React.FC<RideLocationsProps> = () => {
  const { editedRide, isEditing, updateRideField, canEdit } = useRideEdit();
  const { locations } = useLocations();
  const ride = editedRide!;

  // State for managing which location is being changed
  const [changingLocation, setChangingLocation] = useState<
    'pickup' | 'dropoff' | null
  >(null);
  const [customAddress, setCustomAddress] = useState<string>('');
  const [locationSelectorOpen, setLocationSelectorOpen] = useState(false);
  const pickupButtonRef = useRef<HTMLButtonElement>(null);
  const dropoffButtonRef = useRef<HTMLButtonElement>(null);

  const handleStartChanging = (locationType: 'pickup' | 'dropoff') => {
    setChangingLocation(locationType);
    const currentLocation =
      locationType === 'pickup' ? ride.startLocation : ride.endLocation;
    setCustomAddress(currentLocation.address || '');
    setLocationSelectorOpen(true);
  };

  const handleCustomAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const address = event.target.value;
    setCustomAddress(address);

    if (!changingLocation) return;

    const field =
      changingLocation === 'pickup' ? 'startLocation' : 'endLocation';
    const currentLocation =
      changingLocation === 'pickup' ? ride.startLocation : ride.endLocation;

    const updatedLocation: Location = {
      ...currentLocation,
      address,
      name: address || currentLocation.name,
      tag: Tag.CUSTOM,
      lat: 0,
      lng: 0,
    };

    updateRideField(field, updatedLocation);
  };

  const handleLocationSelect = (location: Location) => {
    if (changingLocation) {
      const field =
        changingLocation === 'pickup' ? 'startLocation' : 'endLocation';
      updateRideField(field, location);
    }
    setLocationSelectorOpen(false);
    setChangingLocation(null);
  };

  const handleMapLocationSelect = (location: Location) => {
    if (changingLocation) {
      const field =
        changingLocation === 'pickup' ? 'startLocation' : 'endLocation';
      updateRideField(field, location);
      setChangingLocation(null);
      setLocationSelectorOpen(false);
    }
  };

  const getDisplayLocation = (locationType: 'pickup' | 'dropoff') => {
    return locationType === 'pickup' ? ride.startLocation : ride.endLocation;
  };

  const getCurrentButtonRef = () => {
    return changingLocation === 'pickup' ? pickupButtonRef : dropoffButtonRef;
  };

  return (
    <div className={styles.container}>
      <div className={ENABLE_ADD_RIDE_MAPS ? styles.locationsGrid : styles.locationsGridNoMap}>
        {/* Left side - Address blocks */}
        <div className={styles.locationsContainer}>
          <LocationBlock
            location={getDisplayLocation('pickup')}
            label="Pickup Location"
            icon={<PlaceIcon color="primary" />}
            isPickup={true}
            isChanging={changingLocation === 'pickup'}
            onChangeClick={() => handleStartChanging('pickup')}
            canEdit={isEditing && canEdit}
            dropdownButtonRef={pickupButtonRef}
          />
          <LocationBlock
            location={getDisplayLocation('dropoff')}
            label="Dropoff Location"
            icon={<PlaceIcon color="secondary" />}
            isPickup={false}
            isChanging={changingLocation === 'dropoff'}
            onChangeClick={() => handleStartChanging('dropoff')}
            canEdit={isEditing && canEdit}
            dropdownButtonRef={dropoffButtonRef}
          />

          {/* Custom location text input (similar in spirit to RequestRide modal) */}
          {changingLocation && isEditing && canEdit && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, fontWeight: 500 }}
              >
                Or enter a custom location
              </Typography>
              <TextField
                fullWidth
                size="small"
                label={
                  changingLocation === 'pickup'
                    ? 'Custom pickup address'
                    : 'Custom dropoff address'
                }
                value={customAddress}
                onChange={handleCustomAddressChange}
                placeholder="Start typing an address (e.g., 123 Main St, Ithaca, NY)"
              />
            </Box>
          )}
        </div>

        {/* Right side - Map */}
        {ENABLE_ADD_RIDE_MAPS && (
        <div className={styles.mapAndInfoContainer}>
            <RideMapWithProvider
              startLocation={getDisplayLocation('pickup')}
              endLocation={getDisplayLocation('dropoff')}
              isSelecting={changingLocation !== null}
              availableLocations={
                changingLocation
                  ? locations.filter((location) => {
                      // Don't allow selecting the other location (pickup/dropoff) to prevent duplicates
                      if (changingLocation === 'pickup') {
                        // When changing pickup, don't show current dropoff location
                        return location.id !== ride.endLocation.id;
                      } else {
                        // When changing dropoff, don't show current pickup location
                        return location.id !== ride.startLocation.id;
                      }
                    })
                  : []
              }
              onLocationSelect={handleMapLocationSelect}
              changingLocationType={changingLocation}
            />
        </div>
        )}
      </div>

      {/* Location Selection Popup */}
      {changingLocation && (
        <SearchPopup<Location>
          open={locationSelectorOpen}
          onClose={() => setLocationSelectorOpen(false)}
          onSelect={handleLocationSelect}
          items={(() => {
            // Filter out the temporarily selected location and the other location type
            return locations.filter((location) => {
              // Don't allow selecting the other location (pickup/dropoff) to prevent duplicates
              if (changingLocation === 'pickup') {
                // When changing pickup, don't show current dropoff location
                return location.id !== ride.endLocation.id;
              } else {
                // When changing dropoff, don't show current pickup location
                return location.id !== ride.startLocation.id;
              }
            });
          })()}
          searchType={SearchableType.LOCATION}
          loading={false}
          error={null}
          title={`Select ${
            changingLocation === 'pickup' ? 'Pickup' : 'Dropoff'
          } Location`}
          placeholder="Search locations..."
          selectedItems={
            changingLocation === 'pickup'
              ? [ride.startLocation]
              : changingLocation === 'dropoff'
              ? [ride.endLocation]
              : []
          }
          anchorEl={getCurrentButtonRef().current}
        />
      )}
    </div>
  );
};

export default RideLocations;
