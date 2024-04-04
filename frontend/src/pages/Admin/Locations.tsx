import React, { useEffect, useState } from 'react';
import { Location } from '../../types';
import LocationsTable from '../../components/UserTables/LocationsTable';
import styles from './page.module.css';
import Notification from '../../components/Notification/Notification';
import LocationModal from '../../components/LocationModal/LocationModal';
import { useLocations } from '../../context/LocationsContext';
import SearchBar from '../../components/SearchBar/SearchBar';
import { Tag } from '../../types';
import { Label } from '../../components/FormElements/FormElements';

const Locations = () => {
  useEffect(() => {
    document.title = 'Locations - Carriage';
  }, []);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchedLocations, setSearchLocations] = useState(locations);
  const [searchName, setSearchName] = useState('');
  const [filterByTag, setFilterByTag] = useState('None');
  const loc = useLocations().locations;

  useEffect(() => {
    setLocations(loc);
    setSearchLocations(loc);
  }, [loc]);

  const handleAddLocation = (newLocation: Location) => {
    setLocations(
      [...locations, newLocation].sort((a: Location, b: Location) => {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
      })
    );
  };

  const checkLocationTag = (location: Location, tag: string) => {
    if (tag.localeCompare('None') === 0) {
      return true;
    } else {
      return location.tag.toLowerCase().localeCompare(tag.toLowerCase()) === 0;
    }
  };

  const handleSearchLocationByName = (query: string, tag: string) => {
    setSearchLocations(
      locations.filter((location: Location) => {
        return (
          location.name.toLowerCase().includes(query.toLowerCase()) &&
          checkLocationTag(location, tag)
        );
      })
    );
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
      <SearchBar
        value={searchName}
        onChange={(e) => {
          setSearchName(e.target.value);
          handleSearchLocationByName(e.target.value, filterByTag);
        }}
        placeholder="Search for locations..."
      />
      <div className={styles.filterTag}>
        <Label className={styles.filterLabel} htmlFor="filterBox">
          Filter by Tag:
        </Label>
        <select
          name="filterBox"
          className={styles.filterBox}
          defaultValue={'None'}
          value={filterByTag}
          onChange={(e) => {
            handleSearchLocationByName(searchName, e.target.value);
            setFilterByTag(e.target.value);
          }}
        >
          <option value="None">None</option>
          {Object.values(Tag).map((value, index) => (
            <option key={index} value={value}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <LocationsTable
        locations={searchedLocations}
        setLocations={setSearchLocations}
      />
    </main>
  );
};
export default Locations;
