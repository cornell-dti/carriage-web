import React, { useState, useCallback, useEffect } from 'react';
import { TextField, Paper, CircularProgress } from '@mui/material';
import { useMap } from '@vis.gl/react-google-maps';
import styles from './requestridedialog.module.css';

interface RequestRidePlacesSearchProps {
  onAddressSelect: (address: string, lat: number, lng: number) => void;
  value?: string;
  onValueChange?: (value: string) => void;
}

const RequestRidePlacesSearch: React.FC<RequestRidePlacesSearchProps> = ({
  onAddressSelect,
  value: controlledValue,
  onValueChange,
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState('');
  const [results, setResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const map = useMap();

  const searchPlace = useCallback(
    async (query: string) => {
      console.log('Searching for:', query);
      console.log('Map available:', !!map);
      console.log('Google Maps available:', !!google?.maps?.places);
      
      if (!map || !query) {
        setResults([]);
        setError('Map not initialized or empty query');
        return;
      }

      if (!google?.maps?.places) {
        setError('Google Maps Places API not available');
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const service = new google.maps.places.PlacesService(map);
        const request = {
          query,
          fields: ['name', 'geometry', 'formatted_address'],
        };

        console.log('Making places request:', request);

        service.findPlaceFromQuery(request, (results, status) => {
          console.log('Places response:', { results, status });
          setIsLoading(false);
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            results &&
            results.length > 0
          ) {
            setResults(results);
          } else {
            setResults([]);
            setError(`No matching address found. Status: ${status}`);
          }
        });
      } catch (error) {
        console.error('Error searching place:', error);
        setIsLoading(false);
        setError('Error searching for address');
        setResults([]);
      }
    },
    [map]
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const current = (controlledValue ?? uncontrolledValue).trim();
      if (current) {
        searchPlace(current);
      }
    },
    [controlledValue, uncontrolledValue, searchPlace]
  );

  const handleSelect = useCallback(
    (place: google.maps.places.PlaceResult) => {
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name || '';
        onAddressSelect(address, lat, lng);
        if (onValueChange) {
          onValueChange(address);
        } else {
          setUncontrolledValue(address);
        }

        setResults([]);
        setError('');
      }
    },
    [onAddressSelect, onValueChange]
  );

  return (
    <div className={styles.placesSearch}>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          value={controlledValue ?? uncontrolledValue}
          onChange={(e) => {
            if (onValueChange) {
              onValueChange(e.target.value);
            } else {
              setUncontrolledValue(e.target.value);
            }
            setError('');
          }}
          placeholder="Enter pickup address and press Enter to search"
          helperText={error || 'Press Enter to search for an address'}
          error={!!error}
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: isLoading && <CircularProgress size={20} />,
          }}
        />
      </form>

      {results.length > 0 && (
        <Paper className={styles.resultsContainer} elevation={3}>
          {results.map((place, index) => (
            <div
              key={index}
              className={styles.resultItem}
              onClick={() => handleSelect(place)}
            >
              {place.formatted_address || place.name}
            </div>
          ))}
        </Paper>
      )}
    </div>
  );
};

export default RequestRidePlacesSearch;
