import React, { useEffect } from 'react';
import { useReq } from '../../context/req';
import { Location } from '../../types';
import LocationModal from '../LocationModal/LocationModal';
import { Row, Table } from '../TableComponents/TableComponents';

interface LocationsTableProps {
  locations: Location[]
  setLocations: (locations: Location[]) => void
}

const LocationsTable = ({ locations, setLocations }: LocationsTableProps) => {
  const { withDefaults } = useReq();

  useEffect(() => {
    const getExistingLocations = async () => {
      const locationsData = await fetch('/api/locations', withDefaults())
        .then((res) => res.json())
        .then((data) => data.data);
      const sortedLocations = locationsData.map((location: any) => ({
        id: location.id,
        name: location.name,
        address: location.address,
        ...(location.tag && { tag: location.tag }),
      })).sort((a: Location, b: Location) => {
        if (a.name < b.name) { return -1; }
        if (a.name > b.name) { return 1; }
        return 0;
      });
      setLocations(sortedLocations);
    };
    getExistingLocations();
  }, [withDefaults]);

  const addLocation = (newLocation: Location) => {
    const { id, ...body } = { ...newLocation };
    fetch(
      '/api/locations',
      withDefaults({
        method: 'POST',
        body: JSON.stringify(body),
      }),
    )
      .then((res) => {
        if (res.status !== 200) {
          throw new Error('adding location failed');
        }
        return res.json();
      })
      .then((data) => {
        const validLocation = {
          id: data.id,
          name: data.name,
          address: data.address,
          ...(data.tag && { tag: data.tag }),
        };
        const sortedLocations = [...locations, validLocation].sort((a: Location, b: Location) => {
          if (a.name < b.name) { return -1; }
          if (a.name > b.name) { return 1; }
          return 0;
        });
        setLocations(sortedLocations);
      })
      .catch((e) => console.error(e.message));
  };

  // const deleteLocation = (locationId: string) => {
  //   fetch(`/api/locations/${locationId}`, withDefaults({ method: 'DELETE' }))
  //     .then((res) => {
  //       if (res.status === 200) {
  //         setLocations(locations.filter((l) => l.id !== locationId));
  //       } else {
  //         throw new Error('adding location failed');
  //       }
  //     })
  //     .catch((e) => console.error('removing location failed'));
  // };

  const handleEditLocation = (editedLocation: Location) => {
    setLocations(locations.map((location) => {
      if (location.id === editedLocation.id) {
        return editedLocation;
      }
      return location;
    }));
  };

  const colSizes = [1, 1, 0.75, 0.75];
  const headers = ['Name', 'Address', 'Tag'];

  return (
    <div>
      <Table>
        <Row
          header
          colSizes={colSizes}
          data={headers}
        />
        {locations.map((loc) => {
          const { id, name, address, tag } = loc;
          const tagData = { data: '', tag };
          const editButton = {
            data: <LocationModal existingLocation={loc} onEditLocation={handleEditLocation} />,
          };
          // const deleteButton = {
          //   data: <Button small onClick={() => deleteLocation(id)}>Delete</Button>,
          // };
          const data = [name, address, tagData, editButton];
          return <Row key={id} data={data} colSizes={colSizes} />;
        })}
      </Table>
    </div>
  );
};

export default LocationsTable;
