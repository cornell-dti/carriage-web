import React, { useEffect, useState } from 'react';
import { Location } from '../../types';
import LocationsTable from '../../components/UserTables/LocationsTable';
import styles from './page.module.css';
import Notification from '../../components/Notification/Notification';
import LocationModal from '../../components/LocationModal/LocationModal';
import { useLocations } from '../../context/LocationsContext';
import SearchBar from '../../components/SearchBar/SearchBar';


const Locations = () => {
  useEffect(() => {
    document.title = 'Locations - Carriage';
  }, []);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchedLocations, setSearchLocations] = useState(locations)
  const [searchName, setSearchName] = useState('')
  const loc = useLocations().locations;

  useEffect(() => {
    setLocations(loc);
    setSearchLocations(loc)
  }, [loc]);

  const handleAddLocation = (newLocation: Location) => {
    setLocations(
      [...locations, newLocation].sort((a: Location, b: Location) => {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
      })
    );
  };
  
  const handleSearchLocationByName = (query : string) => {
    setSearchLocations(
      locations.filter(
        (location : Location) => {
          return location.name.toLowerCase().includes(query);
        }
      )
    )
  }
  
  return (
    <main id="main">
      <div className={styles.pageTitle}>
        <h1 className={styles.header}>Locations</h1>
        <div className={styles.rightSection}>
          <LocationModal onAddLocation={handleAddLocation} />
          <Notification />
        </div>
      </div>
      <SearchBar
        value={searchName}
        onChange={(e) => {
          setSearchName(e.target.value);
          handleSearchLocationByName(e.target.value);
        }}
        placeholder="Search for locations..."
      />
      <LocationsTable locations={searchedLocations} setLocations={setSearchLocations} />
    </main>
  );
};

export default Locations;
