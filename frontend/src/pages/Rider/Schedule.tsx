import React, { useContext, useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { Ride, Type, Status, Tag, Accessibility } from '../../types';
import AuthContext from '../../context/auth';
import NoRidesView from '../../components/NoRidesView/NoRidesView';
import Notification from '../../components/Notification/Notification';
import MainCard from '../../components/RiderComponents/MainCard';
import FavoritesCard from '../../components/RiderComponents/FavoritesCard';
import RideTable from '../../components/RiderComponents/RideTable';
import styles from './page.module.css';
import { FormData } from 'components/RiderComponents/RequestRideDialog';
import RequestRideDialog from 'components/RiderComponents/RequestRideDialog';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Driver } from 'types';

// Dummy driver data if none is provided
const dummyDriver: Driver = {
  id: 'driver_1',
  firstName: 'Matthias',
  lastName: 'Choi',
  phoneNumber: '5551234567',
  email: 'mt123@cornell.edu',
  photoLink: '/driver.jpg',
};

// Rider data type
interface RiderData {
  phoneNumber: string;
  active: boolean;
  accessibility: Accessibility[];
  endDate: string;
  lastName: string;
  favoriteLocations: any[];
  joinDate: string;
  address: string;
  email: string;
  id: string;
  firstName: string;
}

// Favorite ride type
interface FavoriteRide {
  id: string;
  name: string;
  startLocation: {
    name: string;
    address: string;
  };
  endLocation: {
    name: string;
    address: string;
  };
  preferredTime: string;
}

const riderData: RiderData = {
  phoneNumber: '5188188059',
  active: true,
  accessibility: [
    Accessibility.ASSISTANT,
    Accessibility.CRUTCHES,
    Accessibility.WHEELCHAIR,
  ],
  endDate: '2024-10-31',
  lastName: 'Atikpui',
  favoriteLocations: [],
  joinDate: '2024-10-17',
  address: '817 N Aurora St, Ithaca, NY 14850',
  email: 'dka34@cornell.edu',
  id: '34a57961-1af4-4fee-82b2-0d85b8485e86',
  firstName: 'Desmond',
};

const dummyRides: Ride[] = [
  {
    id: 'ride_1',
    type: Type.ACTIVE,
    status: Status.NOT_STARTED,
    late: false,
    startLocation: {
      name: 'Bailey Hall',
      address: '123 College Ave',
      tag: Tag.CENTRAL,
    },
    endLocation: {
      name: 'Uris Library',
      address: '456 University St',
      tag: Tag.WEST,
    },
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 30 * 60000).toISOString(),
    rider: riderData,
    recurring: false,
    driver: dummyDriver,
  },
  // ... other dummy rides
];

const favoriteRides: FavoriteRide[] = [
  {
    id: 'fav_1',
    name: 'Systems Lecture',
    startLocation: { name: 'Downtown Hub', address: '789 College Ave' },
    endLocation: { name: 'Philips Hall', address: '456 University St' },
    preferredTime: '8:00 AM',
  },
  {
    id: 'fav_2',
    name: 'Gym Commute',
    startLocation: { name: 'Downtown Hub', address: '789 College Ave' },
    endLocation: { name: 'Noyes Fitness Center', address: '456 University St' },
    preferredTime: '8:00 AM',
  },
  // ... other favorite rides
];

const Schedule: React.FC = () => {
  const { user, id } = useContext(AuthContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rides, setRides] = useState<Ride[]>(dummyRides);
  const [filteredRides, setFilteredRides] = useState<Ride[]>(dummyRides);

  useEffect(() => {
    document.title = 'Schedule - Carriage';
  }, []);

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleRideSubmit = (formData: FormData) => {
    if (!formData.pickupLocation || !formData.dropoffLocation) return;

    const newRide: Ride = {
      id: `ride_${Date.now()}`,
      type: Type.UNSCHEDULED,
      status: Status.NOT_STARTED,
      late: false,
      startLocation: {
        name: formData.pickupLocation.address,
        address: formData.pickupLocation.address,
        tag: Tag.CUSTOM,
      },
      endLocation: {
        name: formData.dropoffLocation.name,
        address: formData.dropoffLocation.address,
        tag: formData.dropoffLocation.tag as Tag,
      },
      startTime: formData.date?.toISOString() ?? new Date().toISOString(),
      endTime: formData.time?.toISOString() ?? new Date().toISOString(),
      rider: riderData,
      recurring: formData.repeatType !== 'none',
    };

    setRides((prevRides) => [...prevRides, newRide]);
    setFilteredRides((prevFiltered) => [...prevFiltered, newRide]);
  };
  // Using the date portion only for comparisons
  const now = new Date().toISOString().split('T')[0];
  const currRides = rides.filter((ride) => ride.endTime >= now);
  const pastRides = rides.filter((ride) => ride.endTime < now);

  const sortedCurrRides = [...currRides].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const mostRecentRide = sortedCurrRides[0];

  const hasDriver =
    mostRecentRide?.driver !== null && mostRecentRide?.driver !== undefined;

  return (
    <APIProvider
      apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string}
      libraries={['places']}
    >
      <main id="main" className={styles.schedulePage}>
        <div className={styles.pageTitle}>
          {user && (
            <h1 className={styles.header}>{user.firstName}'s Schedule</h1>
          )}
          <div className={styles.rightSection}>
            <Button
              variant="contained"
              color="secondary" // Changed color from 'primary' to 'secondary'
              onClick={handleDialogOpen}
              sx={{
                backgroundColor: 'black',
                '&:hover': {
                  backgroundColor: 'black',
                },
              }}
            >
              Request Ride
            </Button>
            <Notification />
          </div>
        </div>
        <div className={styles.topRow}>
          <div className={styles.mainCardContainer}>
            {rides.length > 0 && mostRecentRide && hasDriver && (
              <MainCard ride={mostRecentRide} />
            )}
            {(rides.length === 0 || !hasDriver) && <NoRidesView />}
          </div>
          <div className={styles.favoritesCardContainer}>
            <FavoritesCard
              favorites={favoriteRides}
              onAddNew={() => {}}
              onQuickRequest={() => {}}
            />
          </div>
        </div>
        <div className={styles.tableSection}>
          <RideTable rides={filteredRides} />
        </div>
        <RequestRideDialog
          open={isDialogOpen}
          onClose={handleDialogClose}
          onSubmit={handleRideSubmit} // Use the actual handler instead of console.log
          supportedLocations={[
            {
              id: 1,
              name: 'Campus Center',
              address: '123 Campus Drive',
              info: 'Main campus center',
              tag: 'Central',
              lat: 42.4534531,
              lng: -76.4760776,
            },
            {
              id: 2,
              name: 'North Campus',
              address: '456 North Drive',
              info: 'North campus area',
              tag: 'North',
              lat: 42.4534531,
              lng: -76.4760776,
            },
            {
              id: 3,
              name: 'West Campus',
              address: '789 West Drive',
              info: 'West campus area',
              tag: 'West',
              lat: 42.4534531,
              lng: -76.4760776,
            },
            // Add more locations as needed
          ]}
        />
      </main>
    </APIProvider>
  );
};

export default Schedule;
