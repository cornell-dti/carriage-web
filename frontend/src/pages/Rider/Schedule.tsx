import React, { useContext, useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { RideType } from '@shared/types/ride';
import AuthContext from '../../context/auth';
import NoRidesView from '../../components/NoRidesView/NoRidesView';
import Notification from '../../components/Notification/Notification';
import MainCard from '../../components/RiderComponents/MainCard';
import FavoritesCard from '../../components/RiderComponents/FavoritesCard';
import { RideTable } from '../../components/RideDetails';
import styles from './page.module.css';
import { FormData } from 'components/RiderComponents/RequestRideDialog';
import RequestRideDialog from 'components/RiderComponents/RequestRideDialog';
import { APIProvider } from '@vis.gl/react-google-maps';
import { DriverType, DayOfWeek } from '@shared/types/driver';
import { useLocations } from '../../context/LocationsContext';
import { useRides } from '../../context/RidesContext';
import axios from '../../util/axios';

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

const Schedule: React.FC = () => {
  const { user, id } = useContext(AuthContext);
  const { locations } = useLocations();
  const { unscheduledRides, scheduledRides, refreshRides, refreshRidesByUser } =
    useRides();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [favoriteRides, setFavoriteRides] = useState<FavoriteRide[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [allRiderRides, setAllRiderRides] = useState<RideType[]>([]);
  const [loadingRides, setLoadingRides] = useState(false);

  const fetchFavorites = async () => {
    if (!id) return;
    setLoadingFavorites(true);
    try {
      const response = await axios.get('/api/favorites');
      const favorites = response.data.data || [];
      // Convert rides to FavoriteRide format
      const formattedFavorites: FavoriteRide[] = favorites.map(
        (ride: RideType) => ({
          id: ride.id,
          name: `Ride to ${ride.endLocation}`,
          startLocation: {
            name: ride.startLocation,
            address: ride.startLocation,
          },
          endLocation: {
            name: ride.endLocation,
            address: ride.endLocation,
          },
          preferredTime: new Date(ride.startTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        })
      );
      setFavoriteRides(formattedFavorites);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      setFavoriteRides([]);
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Fetch all rider rides on component mount
  useEffect(() => {
    const fetchRiderRides = async () => {
      if (id) {
        setLoadingRides(true);
        try {
          const rides = await refreshRidesByUser(id, 'rider');
          setAllRiderRides(rides);
        } catch (error) {
          console.error('Failed to fetch rider rides:', error);
        } finally {
          setLoadingRides(false);
        }
      }
    };

    fetchRiderRides();
  }, [id, refreshRidesByUser]);

  useEffect(() => {
    document.title = 'Schedule - Carriage';
    fetchFavorites();
  }, [id]);

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleRideSubmit = async (formData: FormData) => {
    if (!formData.pickupLocation || !formData.dropoffLocation) return;

    // For now, block any recurring rides
    if (formData.repeatType !== 'none') {
      alert(
        'Recurring rides are not yet supported. Please create a single ride.'
      );
      return;
    }

    try {
      // Build ISO datetimes
      if (!formData.date || !formData.time) {
        alert('Please select both date and time.');
        return;
      }

      const dateStr = formData.date.toISOString().split('T')[0];
      const timeStr = formData.time.toTimeString().split(' ')[0];
      const startISO = new Date(`${dateStr}T${timeStr}`).toISOString();

      const endISO = new Date(
        new Date(startISO).getTime() + 30 * 60 * 1000
      ).toISOString();

      await axios.post('/api/rides', {
        // Send location IDs (matching Admin flow)
        startLocation: formData.pickupLocation.id,
        endLocation: formData.dropoffLocation.id,
        startTime: startISO,
        endTime: endISO,
        rider: id,
        type: 'upcoming',
        status: 'not_started',
        schedulingState: 'unscheduled',
      });

      // Refresh rides after successful creation
      await refreshRides();
      console.log('Ride created successfully');
    } catch (error) {
      console.error('Failed to create ride:', error);
      alert('Failed to create ride. Please try again.');
    }
  };

  // Use the fetched rider rides instead of filtering from context
  const allRides = allRiderRides;

  // Using the date portion only for comparisons
  const now = new Date().toISOString().split('T')[0];
  console.log('Current date (YYYY-MM-DD):', now);

  const currRides = allRides.filter((ride) => {
    const rideEndDate = ride.endTime.split('T')[0];
    const isCurrent = ride.endTime >= now;
    console.log(
      `Ride ${ride.id}: endTime=${ride.endTime}, endDate=${rideEndDate}, isCurrent=${isCurrent}`
    );
    return isCurrent;
  });
  const pastRides = allRides.filter((ride) => ride.endTime < now);

  console.log('Current rides:', currRides);
  console.log('Past rides:', pastRides);

  const sortedCurrRides = [...currRides].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const nextUpcomingRide = sortedCurrRides[0];

  const hasUpcomingRide = nextUpcomingRide !== undefined;

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
              color="secondary"
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
            {allRides.length > 0 && nextUpcomingRide && hasUpcomingRide && (
              <MainCard ride={nextUpcomingRide} />
            )}
            {(allRides.length === 0 || !hasUpcomingRide) && <NoRidesView />}
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
          <RideTable rides={allRides} userRole="rider" />
        </div>
        <RequestRideDialog
          open={isDialogOpen}
          onClose={handleDialogClose}
          onSubmit={handleRideSubmit}
          supportedLocations={locations
            .map((l) => ({
              id: String(l.id),
              name: l.name,
              address: l.address,
              shortName: l.shortName,
              info: l.info ?? '',
              tag: (l.tag as any) ?? '',
              lat: Number(l.lat),
              lng: Number(l.lng),
              photoLink: l.photoLink,
              images: l.images,
            }))
            .filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng))}
        />
      </main>
    </APIProvider>
  );
};

export default Schedule;
