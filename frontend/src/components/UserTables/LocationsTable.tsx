import React from 'react';
import { Location } from '../../types';
import LocationModal from '../LocationModal/LocationModal';
import { Row, Table } from '../TableComponents/TableComponents';

interface LocationsTableProps {
  locations: Location[];
  setLocations: (locations: Location[]) => void;
}

const LocationsTable = ({ locations, setLocations }: LocationsTableProps) => {
  const handleEditLocation = (editedLocation: Location) => {
    setLocations(
      locations.map((location) => {
        if (location.id === editedLocation.id) {
          return editedLocation;
        }
        return location;
      })
    );
  };

  const colSizes = [1, 1, 0.75, 0.75];
  const headers = ['Name', 'Address', 'Tag'];

  return (
    <div>
      <Table>
        <Row header colSizes={colSizes} data={headers} />
        {locations.map((loc) => {
          const { id, name, address, tag } = loc;
          const tagData = { data: '', tag };
          const editButton = {
            data: (
              <LocationModal
                existingLocation={loc}
                onEditLocation={handleEditLocation}
              />
            ),
          };
          const data = [name, address, tagData, editButton];
          return <Row key={id} data={data} colSizes={colSizes} />;
        })}
      </Table>
    </div>
  );
};

export default LocationsTable;
