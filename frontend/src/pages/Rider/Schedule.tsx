import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button } from '@mui/material';
import { Ride } from '../../types';
import AuthContext from '../../context/auth';
import NoRidesView from '../../components/NoRidesView/NoRidesView';
import Notification from '../../components/Notification/Notification';
import MainCard from '../../components/RiderComponents/MainCard';
import FavoritesCard from '../../components/RiderComponents/FavoritesCard';
import styles from './page.module.css';
import { FormData } from 'components/RiderComponents/RequestRideDialog';
import RequestRideDialog from 'components/RiderComponents/RequestRideDialog';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useLocations } from '../../context/LocationsContext';
import { useRides } from '../../context/RidesContext';
import axios from '../../util/axios';
import ResponsiveRideCard from '../../components/ResponsiveRideCard';
import { RideDetailsComponent } from 'components/RideDetails';

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

type DayRideCollection = [string, Ride[]][];

const partitionRides = (rides: Ride[]): DayRideCollection => {
  const sortedRides = [...rides].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const formatReadableDate = (date: Date) => {
    const weekday = date.toLocaleString(undefined, { weekday: 'long' });
    const month = date.toLocaleString(undefined, { month: 'long' });
    const day = date.getDate();

    const suffix =
      day % 10 === 1 && day % 100 !== 11
        ? 'st'
        : day % 10 === 2 && day % 100 !== 12
        ? 'nd'
        : day % 10 === 3 && day % 100 !== 13
        ? 'rd'
        : 'th';

    return `${weekday}, ${month} ${day}${suffix}`;
  };

  const dayMap = new Map<string, Ride[]>();

  sortedRides.forEach((ride) => {
    const day = formatReadableDate(new Date(ride.startTime));
    const ridesForDay = dayMap.get(day);
    if (ridesForDay) {
      ridesForDay.push(ride); // just push
    } else {
      dayMap.set(day, [ride]);
    }
  });

  const flattened: DayRideCollection = [...dayMap].sort(
    ([_aStr, aRides], [_bStr, bRides]) =>
      new Date(aRides[0].startTime).getTime() -
      new Date(bRides[0].startTime).getTime()
  );

  return flattened;
};

const Schedule: React.FC = () => {
  const { user, id } = useContext(AuthContext);
  const { locations } = useLocations();
  const { unscheduledRides, scheduledRides, refreshRides, refreshRidesByUser } =
    useRides();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [favoriteRides, setFavoriteRides] = useState<FavoriteRide[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [allRiderRides, setAllRiderRides] = useState<Ride[]>([]);
  const [loadingRides, setLoadingRides] = useState(false);

  const [editingRide, setEditingRide] = useState<null | Ride>(null);

  const fetchFavorites = async () => {
    if (!id) return;
    setLoadingFavorites(true);
    try {
      const response = await axios.get('/api/favorites');
      const favorites = response.data.data || [];
      // Convert rides to FavoriteRide format
      const formattedFavorites: FavoriteRide[] = favorites.map(
        (ride: Ride) => ({
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

  const rideDayMap: DayRideCollection = useMemo(() => {
    return partitionRides(allRides);
  }, [allRides]);

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
        <div
          style={{
            width: '100%',
            height: 'min-content',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'start',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          {rideDayMap.map(([day, rides]) => {
            return (
              <div
                key={day}
                style={{
                  width: '100%',
                  maxWidth: '48rem',
                  height: 'min-content',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'start',
                  alignItems: 'start',
                  gap: '0.25rem',
                }}
              >
                <h2
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 'lighter',
                    color: '#707070',
                  }}
                >
                  {day}
                </h2>
                {rides.map((ride, rideIdx) => (
                  <ResponsiveRideCard
                    ride={ride}
                    handleEdit={setEditingRide}
                    key={rideIdx}
                  />
                ))}
              </div>
            );
          })}
          {/* {currRides.map((ride, idx) => (
            <ResponsiveRideCard ride={ride} handleEdit={() => {}} key={idx} />
          ))} */}
        </div>

        {/* <div className={styles.tableSection}>
          <RideTable rides={allRides} userRole="rider" />
        </div> */}
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
        {editingRide && (
          <RideDetailsComponent
            ride={editingRide}
            open={editingRide !== null}
            onClose={() => setEditingRide(null)}
          ></RideDetailsComponent>
        )}
      </main>
    </APIProvider>
  );
};

export default Schedule;
