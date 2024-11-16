import React, { useState, useMemo, useEffect } from 'react';
import SearchAndFilter from 'components/FormElements/SearchAndFilter';
import { LocationMap } from './LocationMap';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Chip } from '@mui/material';
import styles from './locations.module.css';


// TODO : Move to the index.ts file cleaner code = better code
interface Location {
  id: number;
  name: string;
  address: string;
  info: string;
  tag: string;
  lat: number;
  lng: number;
}

interface LocationsContentProps {
  locations: Location[];
}

const LocationsContent: React.FC<LocationsContentProps> = ({ locations }) => {
  const [filteredLocations, setFilteredLocations] = useState<Location[]>(locations);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Update filtered locations whenever locations prop changes
  useEffect(() => {
    console.log('Locations updated in LocationsContent:', locations);
    setFilteredLocations(locations);
  }, [locations]);

  const uniqueTags = useMemo(() => 
    Array.from(new Set(locations.map(location => location.tag))),
    [locations]
  );

  const handleFilterApply = (filteredItems: Location[]) => {
    console.log('Filter applied:', filteredItems);
    setFilteredLocations(filteredItems);
  };

  return (
    <div className={styles.mainContent}>
      {/* Left Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.searchFilterWrapper}>
          <SearchAndFilter
            items={locations}
            searchFields={['name', 'address']}
            filterOptions={[
              {
                field: 'tag',
                label: 'Type',
                options: uniqueTags.map(tag => ({
                  value: tag,
                  label: tag.charAt(0).toUpperCase() + tag.slice(1)
                }))
              }
            ]}
            onFilterApply={handleFilterApply}
          />
        </div>

        <div className={styles.locationsList}>
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              onClick={() => setSelectedLocation(location)}
              className={`${styles.locationItem} ${
                selectedLocation?.id === location.id
                  ? styles.locationItemSelected
                  : ''
              }`}
            >
              <div className={styles.locationContent}>
                <LocationOnIcon
                  sx={{
                    color: '#1976d2',
                    marginRight: '0.75rem',
                    marginTop: '0.25rem',
                  }}
                />
                <div className={styles.locationInfo}>
                  <div className={styles.locationHeader}>
                    <h3 className={styles.locationName}>{location.name}</h3>
                    <Chip
                      label={location.tag}
                      size="small"
                      sx={{ marginLeft: '0.5rem' }}
                    />
                  </div>
                  <p className={styles.locationDetails}>{location.address}</p>
                  <p className={styles.locationDetails}>{location.info}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className={styles.mapContainer}>
        <LocationMap
          locations={filteredLocations}
          selectedLocation={selectedLocation}
          onLocationSelect={setSelectedLocation}
        />
      </div>
    </div>
  );
};

export default LocationsContent;