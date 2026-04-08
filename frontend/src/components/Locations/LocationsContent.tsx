import React, { useState, useMemo, useEffect } from 'react';
import SearchAndFilter from 'components/FormElements/SearchAndFilter';
import { LocationMap } from './LocationMap';
import { Chip } from '@mui/material';
import LocationDialog from './LocationDialog';
import { OpenInFull, LocationOn } from '@mui/icons-material';
import { LocationType } from '@carriage-web/shared/types/location';

interface LocationsContentProps {
  locations: LocationType[];
  onUpdateLocation?: (updatedLocation: LocationType) => void;
}

const LocationsContent: React.FC<LocationsContentProps> = ({
  locations,
  onUpdateLocation,
}) => {
  const [filteredLocations, setFilteredLocations] =
    useState<LocationType[]>(locations);
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(
    null
  );
  const [selectedLocationForDialog, setSelectedLocationForDialog] =
    useState<LocationType | null>(null);

  useEffect(() => {
    setFilteredLocations(locations);
  }, [locations]);

  const uniqueTags = useMemo(
    () => Array.from(new Set(locations.map((location) => location.tag))),
    [locations]
  );

  const handleFilterApply = (filteredItems: LocationType[]) => {
    setFilteredLocations(filteredItems);
  };

  const handleListItemClick = (location: LocationType) => {
    setSelectedLocation(location);
  };

  const handleLocationUpdate = (updatedLocation: LocationType) => {
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
    <div className="grid grid-cols-[400px_1fr] gap-4 p-0 px-8 relative">
      <div className="flex flex-col gap-3 h-full min-h-0">
        <div className="h-[38px] min-h-[38px] shrink-0 bg-white rounded-sm p-0 px-2">
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

        <div className="flex-1 overflow-y-auto bg-gray-100 rounded-sm p-4 min-h-0 max-h-[calc(100vh-300px)]">
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              onClick={() => handleListItemClick(location)}
              className={`bg-white rounded-sm p-4 mb-4 cursor-pointer transition-all duration-200 ease-in-out ${
                selectedLocation?.id === location.id
                  ? 'border-2 border-blue-600'
                  : ''
              } hover:shadow-md`}
            >
              <div className="flex">
                <LocationOn
                  sx={{
                    color: '#1976d2',
                    marginRight: '0.75rem',
                    marginTop: '0.25rem',
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="font-semibold">{location.name}</h3>
                    <Chip
                      label={location.tag}
                      size="small"
                      sx={{ marginLeft: '0.5rem' }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{location.address}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">{location.info}</p>
                    <OpenInFull
                      expandIcon}
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

      <div>
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
