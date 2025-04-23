import React, { useState, useEffect } from 'react';
import { Button } from '../../components/FormElements/FormElements';
import CopyButton from '../../components/CopyButton/CopyButton';
import Notification from '../../components/Notification/Notification';
import LocationsContent from 'components/Locations/LocationsContent';
import styles from './page.module.css';
import { LocationFormModal } from 'components/Locations/LocationFormModal';
import { Location } from 'types';
import { useLocations } from 'context/LocationsContext';

const Locations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const loc = useLocations().locations;
  useEffect(() => {
    setLocations(loc);
  }, [loc]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddLocation = (newLocation: Location) => {
    setLocations(
      [...locations, newLocation].sort((a: Location, b: Location) => {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
      })
    );
    setIsAddDialogOpen(false);
  };

  useEffect(() => {
    document.title = 'Locations';
  }, []);

  const handleUpdateLocation = (updatedLocation: Location) => {
    setLocations((prevLocations) =>
      prevLocations.map((location) =>
        location.id === updatedLocation.id ? updatedLocation : location
      )
    );
  };

  return (
    <main id="main">
      <div className={styles.pageTitle}>
        <h1 className={styles.header}>Locations</h1>
        <div className={styles.rightSection}>
          <CopyButton />
          <Button onClick={() => setIsAddDialogOpen(true)}>
            + Add Location
          </Button>
          <Notification />
        </div>
      </div>

      <LocationsContent
        locations={locations}
        onUpdateLocation={handleUpdateLocation}
      />

      <LocationFormModal
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddLocation}
        mode="add"
      />
    </main>
  );
};

export default Locations;
