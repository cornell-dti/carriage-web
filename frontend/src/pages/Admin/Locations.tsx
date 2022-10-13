import React, { useEffect, useState } from 'react';
import { useReq } from '../../context/req';
import { Location } from '../../types';
import LocationsTable from '../../components/UserTables/LocationsTable';
import styles from './page.module.css';
import Notification from '../../components/Notification/Notification';
import LocationModal from '../../components/LocationModal/LocationModal';
import { useLocations } from '../../context/LocationsContext';

const Locations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const loc = useLocations().locations;

  useEffect(() => {
    setLocations(loc);
    window.localStorage.setItem("lastPage", "/admin/locations")
  }, [loc]);  

  const handleAddLocation = (newLocation: Location) => {
    setLocations([...locations, newLocation]);
  };

  return (
    <main id="main">
      <div className={styles.pageTitle}>
        <h1 className={styles.header}>Locations</h1>
        <div className={styles.rightSection}>
          <LocationModal onAddLocation={handleAddLocation} />
          <Notification />
        </div>
      </div>
      <LocationsTable locations={locations} setLocations={setLocations} />
    </main>
  );
};

export default Locations;
