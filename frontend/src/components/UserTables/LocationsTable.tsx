import React, { useState, useEffect } from 'react';
import Form from '../UserForms/LocationsForm';
import { Location } from '../../types';
import styles from './table.module.css';

const Table = () => {
  const [locations, setLocations] = useState<Location[]>([]);

  const getExistingLocations = async () => {
    const locationsData = await fetch('/locations')
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

  useEffect(() => {
    getExistingLocations();
  }, []);

  const addLocation = (newLocation: Location) => {
    const { id, ...body } = { ...newLocation };
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    };
    fetch('/locations', requestOptions)
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
    const requestOptions = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    };
    fetch(`/locations/${locationId}`, requestOptions)
      .then((res) => {
        if (res.status === 200) {
          setLocations(locations.filter((l) => l.id !== locationId));
        } else {
          throw new Error('adding location failed');
        }
      })
      .catch((e) => console.error('removing location failed'));
  };

  const renderTableHeader = () => (
    <tr>
      <th className={styles.tableHeader}>Name</th>
      <th className={styles.tableHeader}>Address</th>
      <th className={styles.tableHeader}>Tag</th>
    </tr>
  );

  return (
    <div>
      <div>
        <h1 className={styles.formHeader}>Location Table</h1>
        <table className={styles.table}>
          <tbody>
            {renderTableHeader()}
            {locations.map(({ id, name, address, tag }, index) => (
              <tr key={index}>
                <td className={styles.tableHeader}>{name}</td>
                <td>{address}</td>
                <td> {tag}</td>
                <td>
                  <button onClick={() => deleteLocation(id)}>Delete</button>
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
