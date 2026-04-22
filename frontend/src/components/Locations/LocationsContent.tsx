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
    <div className="grid grid-cols-[400px_1fr] gap-4 px-8 relative">
      <div className="flex flex-col gap-3 h-full min-h-0">
        <div className="h-9.5 min-h-9.5 shrink-0 bg-white rounded px-2">
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

        <div className="flex-1 overflow-y-auto bg-[#f5f5f5] rounded p-4 min-h-0 max-h-[calc(100vh-300px)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#f1f1f1] [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-[#c1c1c1] [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-[#a8a8a8]">
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              onClick={() => handleListItemClick(location)}
              className={`bg-white rounded p-4 mb-4 last:mb-0 cursor-pointer transition-all duration-200 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)] ${
                selectedLocation?.id === location.id
                  ? 'border-2 border-[#1976d2]'
                  : ''
              }`}
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
                    <h3 className="m-0 text-[1.1rem]">{location.name}</h3>
                    <Chip
                      label={location.tag}
                      size="small"
                      sx={{ marginLeft: '0.5rem' }}
                    />
                  </div>
                  <p className="mt-2 mb-0 text-[#666] text-[0.9rem]">
                    {location.address}
                  </p>
                  <div className="text-[#666] flex items-center justify-between">
                    <p className="mt-2 mb-0 text-[#666] text-[0.9rem]">
                      {location.info}
                    </p>
                    <OpenInFull
                      className="-scale-x-100"
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

      <div className="relative h-full rounded overflow-hidden">
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
