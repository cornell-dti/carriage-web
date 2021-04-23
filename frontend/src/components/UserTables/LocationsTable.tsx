import React, { useState, useEffect } from 'react';
import { Row, Table } from '../TableComponents/TableComponents';
import Form from '../UserForms/LocationsForm';
import { Button } from '../FormElements/FormElements';
import { Location } from '../../types';
import { useReq } from '../../context/req';

const LocationsTable = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const { withDefaults } = useReq();

  useEffect(() => {
    const getExistingLocations = async () => {
      const locationsData = await fetch('/api/locations', withDefaults())
        .then((res) => res.json())
        .then((data) => data.data);
      setLocations(
        locationsData.map((location: any) => ({
          id: location.id,
          name: location.name,
          address: location.address,
          ...(location.tag && { tag: location.tag }),
        })),
      );
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
        setLocations([...locations, validLocation]);
      })
      .catch((e) => console.error(e.message));
  };

  const deleteLocation = (locationId: string) => {
    fetch(`/locations/${locationId}`, withDefaults({ method: 'DELETE' }))
      .then((res) => {
        if (res.status === 200) {
          setLocations(locations.filter((l) => l.id !== locationId));
        } else {
          throw new Error('adding location failed');
        }
      })
      .catch((e) => console.error('removing location failed'));
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
          const deleteButton = {
            data: <Button small onClick={() => deleteLocation(id)}>Delete</Button>,
          };
          const data = [name, address, tagData, deleteButton];
          return <Row key={id} data={data} colSizes={colSizes} />;
        })}
      </Table>
    </div>
  );
};

export default LocationsTable;
