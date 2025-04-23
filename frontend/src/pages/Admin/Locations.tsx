import React, { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Button } from '../../components/FormElements/FormElements';
import CopyButton from '../../components/CopyButton/CopyButton';
import Notification from '../../components/Notification/Notification';
import LocationsContent from '../../components/Locations/LocationsContent';
import styles from './page.module.css';
import { LocationFormModal } from '../../components/Locations/LocationFormModal';

// TODO : Move interface to index.ts

interface Location {
  id: number;
  name: string;
  address: string;
  shortName: string;
  info: string;
  tag: string;
  lat: number;
  lng: number;
}

const INITIAL_LOCATIONS: Location[] = [
  {
    id: 1,
    name: 'Noyes Fitness Center',
    address: '306 West Ave, Ithaca, NY 14850',
    shortName: 'Noyes',
    info: 'Gym',
    tag: 'West Campus',
    lat: 42.4473817,
    lng: -76.489763,
  },
  {
    id: 2,
    name: 'Robert Purcell Community Center',
    address: '107 Jessup Rd, Ithaca, NY 14850',
    shortName: 'RPCC',
    info: 'RPCC',
    tag: 'North Campus',
    lat: 42.451896,
    lng: -76.4798383,
  },
  {
    id: 3,
    name: 'The Statler Hotel at Cornell University',
    address: '130 Statler Dr Ithaca, NY 14853',
    shortName: 'Statler',
    info: 'Statler Hotel',
    tag: 'Central Campus',
    lat: 42.4462031,
    lng: -76.482042,
  },
];

const Locations = () => {
  const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    document.title = 'Locations';
  }, []);

  const handleAddLocation = (locationData: Omit<Location, 'id'>) => {
    const newLocation: Location = {
      ...locationData,
      id: Date.now(),
    };
    setLocations((prevLocations) => {
      const updated = [...prevLocations, newLocation];
      return updated;
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateLocation = (updatedLocation: Location) => {
    setLocations((prevLocations) =>
      prevLocations.map((location) =>
        location.id === updatedLocation.id ? updatedLocation : location
      )
    );
  };

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string}
      libraries={['places']}
    >
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
    </APIProvider>
  );
};

export default Locations;
