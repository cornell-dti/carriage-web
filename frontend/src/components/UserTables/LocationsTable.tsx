import React, { useState, useEffect } from 'react';
import Form from '../UserForms/LocationsForm';
import { Location } from '../../types';
import './table.css';

const Table = () => {
  const [locations, setLocations] = useState<Location[]>([]);

  const getExistingLocations = async () => {
    const locationsData = await fetch('/locations')
      .then((res) => res.json())
      .then((data) => data.data);
    setLocations(locationsData.map((location: any) => ({
      id: location.id,
      name: location.name,
      address: location.address,
    })));
  };

  useEffect(() => {
    getExistingLocations();
  }, []);

  const addLocation = (newLocation: Location) => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newLocation.name,
        address: newLocation.address,
      }),
    };
    fetch('/locations', requestOptions).then((res) => {
      if (res.status === 200) {
        setLocations([...locations, newLocation]);
      } else {
        // TODO: alert
      }
    });
  };

  const deleteLocation = (locationId: string) => {
    const requestOptions = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    };
    fetch(`/locations/${locationId}`, requestOptions).then((res) => {
      if (res.status === 200) {
        setLocations(locations.filter((l) => l.id !== locationId));
      } else {
        // TODO: alert
      }
    });
  };

  return (
    <div>
      <div>
        <h1 className="formHeader">Location Table</h1>
        <table className="table">
          <tbody>
            <tr>
              <th className="tableHeader">Name</th>
              <th className="tableHeader">Address</th>
            </tr>
            {locations.map(({ id, name, address }, index) => (
              <tr key={index}>
                <td className="tableCell">{name}</td>
                <td>{address}</td>
                <td>
                  <button onClick={() => deleteLocation(id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Form onClick={addLocation} />
    </div>
  );
};

export default Table;
