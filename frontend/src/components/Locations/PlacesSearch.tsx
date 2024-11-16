import React, { useState, useCallback } from 'react';
import { TextField, Paper, CircularProgress, FormHelperText } from '@mui/material';
import { useMap } from '@vis.gl/react-google-maps';
import styles from './locations.module.css';

interface PlacesSearchProps {
  onAddressSelect: (address: string, lat: number, lng: number) => void;
}

export const PlacesSearch: React.FC<PlacesSearchProps> = React.memo(({ onAddressSelect }) => {
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const map = useMap();

  const searchPlace = useCallback(async (query: string) => {
    if (!map || !query) {
      setResults([]);
      setError('');
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

      service.findPlaceFromQuery(request, (results, status) => {
        setIsLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          setResults(results);
        } else {
          setResults([]);
          setError('No matching address found');
        }
      });
    } catch (error) {
      console.error('Error searching place:', error);
      setIsLoading(false);
      setError('Error searching for address');
      setResults([]);
    }
  }, [map]);

  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    if (searchValue.trim()) {
      searchPlace(searchValue);
    }
  }, [searchValue, searchPlace]);

  const handleSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || place.name || '';
      onAddressSelect(address, lat, lng);
      setSearchValue(address);
      setResults([]);
      setError('');
    }
  }, [onAddressSelect]);

  return (
    <div className={styles.placesSearch}>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setError(''); // Clear error when user types
          }}
          placeholder="Enter address and press Enter to search"
          helperText={error || "Press Enter to search for an address"}
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
});