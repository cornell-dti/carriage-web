import React, { useState, useMemo, useEffect } from 'react';
import SearchAndFilter from '../../components/FormElements/SearchAndFilter';
import { LocationMap } from './LocationMap';
import { Chip } from '@mui/material';
import styles from './locations.module.css';
import LocationDialog from './LocationDialog';
import { OpenInFull, LocationOn } from '@mui/icons-material';
import { Location } from '../../types';

interface LocationsContentProps {
  locations: Location[];
  onUpdateLocation?: (updatedLocation: Location) => void;
}

const LocationsContent: React.FC<LocationsContentProps> = ({
  locations,
  onUpdateLocation,
}) => {
  const [filteredLocations, setFilteredLocations] =
    useState<Location[]>(locations);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [selectedLocationForDialog, setSelectedLocationForDialog] =
    useState<Location | null>(null);

  useEffect(() => {
    setFilteredLocations(locations);
  }, [locations]);

  const uniqueTags = useMemo(
    () => Array.from(new Set(locations.map((location) => location.tag))),
    [locations]
  );

  const handleFilterApply = (filteredItems: Location[]) => {
    setFilteredLocations(filteredItems);
  };

  const handleListItemClick = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleLocationUpdate = (updatedLocation: Location) => {
    if (onUpdateLocation) {
      onUpdateLocation(updatedLocation);

      // Update the selected location with new data
      setSelectedLocation(updatedLocation);
      setSelectedLocationForDialog(updatedLocation);

      // Update the filtered locations list
      setFilteredLocations((prev) =>
        prev.map((loc) =>
          loc.id === updatedLocation.id ? updatedLocation : loc
        )
      );
    }
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.leftPanel}>
        <div className={styles.searchFilterWrapper}>
          <SearchAndFilter
            items={locations}
            searchFields={['name', 'address']}
            filterOptions={[
              {
                field: 'tag',
                label: 'Type',
                options: uniqueTags.map((tag) => ({
                  value: tag,
                  label: tag.charAt(0).toUpperCase() + tag.slice(1),
                })),
              },
            ]}
            onFilterApply={handleFilterApply}
          />
        </div>

        <div className={styles.locationsList}>
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              onClick={() => handleListItemClick(location)}
              className={`${styles.locationItem} ${
                selectedLocation?.id === location.id
                  ? styles.locationItemSelected
                  : ''
              }`}
            >
              <div className={styles.locationContent}>
                <LocationOn
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
                  <div className={styles.locationFooter}>
                    <p className={styles.locationDetails}>{location.info}</p>
                    <OpenInFull
                      className={styles.expandIcon}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLocationForDialog(location);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.mapContainer}>
        <LocationMap
          locations={filteredLocations}
          selectedLocation={selectedLocation}
          onLocationSelect={setSelectedLocation}
          onViewDetails={setSelectedLocationForDialog}
        />
      </div>

      <LocationDialog
        location={selectedLocationForDialog}
        onClose={() => setSelectedLocationForDialog(null)}
        onSave={handleLocationUpdate}
      />
    </div>
  );
};

export default LocationsContent;
