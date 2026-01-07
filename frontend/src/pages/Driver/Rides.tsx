import React, { useState, useContext, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Stack,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import PlaceIcon from '@mui/icons-material/Place';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import { useRides } from '../../context/RidesContext';
import { useDate } from '../../context/date';
import AuthContext from '../../context/auth';
import { Ride, Status } from '../../types';
import axios from '../../util/axios';
import { RideTable } from '../../components/RideDetails';
import NoRidesView from '../../components/NoRidesView/NoRidesView';
import ContactInfoModal from '../../components/ContactInfoModal/ContactInfoModal';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import UpdateStatusModal from '../../components/UpdateStatusModal/UpdateStatusModal';

const getStatusColor = (
  status: Status
): 'default' | 'primary' | 'info' | 'warning' | 'success' | 'error' => {
  switch (status) {
    case Status.NOT_STARTED:
      return 'default';
    case Status.ON_THE_WAY:
      return 'primary';
    case Status.ARRIVED:
      return 'info';
    case Status.PICKED_UP:
      return 'warning';
    case Status.COMPLETED:
      return 'success';
    case Status.NO_SHOW:
    case Status.CANCELLED:
      return 'error';
    default:
      return 'default';
  }
};

const mapLink = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;

// Fallback function to calculate approximate distance using Haversine formula
const getApproximateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
};

const RideDetailCard = ({
  ride,
  isCurrent,
  updating,
  onUpdate,
}: {
  ride: Ride | undefined;
  isCurrent: boolean;
  updating?: boolean;
  onUpdate?: (rideId: string, status: Status) => void;
}) => {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [tripInfo, setTripInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const mapsLibrary = useMapsLibrary('routes');

  useEffect(() => {
    if (!mapsLibrary || !ride) {
      setTripInfo(null);
      return;
    }
    const directionsService = new mapsLibrary.DirectionsService();

    const origin = ride.startLocation.address;
    const destination = ride.endLocation.address;

    // Debug logging: input data
    console.log('[Directions] Ride:', ride.id);
    console.log('[Directions] Origin address:', origin);
    console.log(
      '[Directions] Origin coords:',
      ride.startLocation.lat,
      ride.startLocation.lng
    );
    console.log('[Directions] Destination address:', destination);
    console.log(
      '[Directions] Destination coords:',
      ride.endLocation.lat,
      ride.endLocation.lng
    );

    if (!origin || !destination) {
      if (
        ride.startLocation.lat &&
        ride.startLocation.lng &&
        ride.endLocation.lat &&
        ride.endLocation.lng
      ) {
        const distance = getApproximateDistance(
          ride.startLocation.lat,
          ride.startLocation.lng,
          ride.endLocation.lat,
          ride.endLocation.lng
        );
        console.log(
          '[Directions][Fallback] Haversine distance (mi):',
          distance
        );
        setTripInfo({
          distance: `${distance} mi`,
          duration: `${Math.round(distance * 2)} min`,
        });
      } else {
        console.warn(
          '[Directions] Missing addresses and coordinates; cannot compute'
        );
        setTripInfo({ distance: '', duration: '' });
      }
      return;
    }

    directionsService.route(
      {
        origin,
        destination,
        travelMode: mapsLibrary.TravelMode.DRIVING,
      },
      (result, status) => {
        console.log('[Directions] Status:', status);
        const leg = result?.routes?.[0]?.legs?.[0];
        if (status === mapsLibrary.DirectionsStatus.OK && leg) {
          const rawDistance = leg.distance?.text || '';
          const rawDuration = leg.duration?.text || '';
          setTripInfo({
            distance: rawDistance,
            duration: rawDuration,
          });
        } else {
          console.warn('[Directions] Failed to compute. Result:', result);
          setTripInfo({ distance: '', duration: '' });
        }
      }
    );
  }, [mapsLibrary, ride]);

  const allStatuses: Status[] = useMemo(() => {
    return Object.values(Status) as Status[];
  }, []);

  if (!ride) {
    return (
      <Card sx={{ width: '100%', height: '100%' }}>
        <CardContent>
          <NoRidesView
            compact
            message={
              isCurrent
                ? 'No current ride in progress'
                : 'No upcoming rides scheduled'
            }
          />
        </CardContent>
      </Card>
    );
  }

  // Use primary rider (first in array) for driver interface
  const primaryRider =
    ride.riders && ride.riders.length > 0 ? ride.riders[0] : null;
  const { startLocation, endLocation, startTime, status } = ride;

  const handleStatusUpdate = async (newStatus: Status) => {
    if (onUpdate) {
      await onUpdate(ride.id, newStatus);
    }
  };

  const canNavigateToPickup = ![
    Status.PICKED_UP,
    Status.COMPLETED,
    Status.CANCELLED,
  ].includes(status);
  const navigationTarget = canNavigateToPickup ? startLocation : endLocation;

  return (
    <>
      <Card
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant="h6">
              {isCurrent ? 'Current Ride' : 'Upcoming Ride'}
            </Typography>
            <Chip
              label={status.replace(/_/g, ' ')}
              color={getStatusColor(status)}
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
            <Avatar
              src={primaryRider?.photoLink}
              sx={{ width: 48, height: 48, mr: 2 }}
            >
              {primaryRider
                ? `${primaryRider.firstName.charAt(
                    0
                  )}${primaryRider.lastName.charAt(0)}`
                : '?'}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                {primaryRider
                  ? `${primaryRider.firstName} ${primaryRider.lastName.charAt(
                      0
                    )}`
                  : 'No rider assigned'}
                {ride.riders &&
                  ride.riders.length > 1 &&
                  ` +${ride.riders.length - 1} more`}
              </Typography>
            </Box>
            <IconButton
              onClick={() => setContactModalOpen(true)}
              aria-label="Show contact info"
            >
              <PhoneIcon />
            </IconButton>
          </Box>

          {primaryRider &&
            primaryRider.accessibility &&
            primaryRider.accessibility.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  gutterBottom
                >
                  ACCESSIBILITY NEEDS
                </Typography>
                <Box
                  sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}
                >
                  {primaryRider.accessibility.map((need: string) => (
                    <Chip key={need} label={need} size="small" />
                  ))}
                </Box>
              </Box>
            )}

          <Divider sx={{ my: 2 }} />

          {/* Locations - compact with same icon */}
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PlaceIcon color="action" sx={{ mr: 1.5 }} />
              <Typography variant="body2">
                <b>From:</b> {startLocation.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PlaceIcon color="action" sx={{ mr: 1.5 }} />
              <Typography variant="body2">
                <b>To:</b> {endLocation.name}
              </Typography>
            </Box>
          </Stack>

          {/* ETA and distance with clear icons */}
          <Grid container spacing={2} sx={{ mt: 1, color: 'text.secondary' }}>
            {tripInfo && (
              <>
                <Grid
                  item
                  xs={6}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <TimelapseIcon sx={{ mr: 1 }} fontSize="small" />
                  <Typography variant="body2">{tripInfo.duration}</Typography>
                </Grid>
                <Grid
                  item
                  xs={6}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <DirectionsCarIcon sx={{ mr: 1 }} fontSize="small" />
                  <Typography variant="body2">{tripInfo.distance}</Typography>
                </Grid>
              </>
            )}
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ mr: 1 }} fontSize="small" />
              <Typography variant="body2">
                {new Date(startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' - '}
                {new Date(ride.endTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>

        <Box sx={{ p: 2, pt: 1 }}>
          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              variant="contained"
              size="small"
              startIcon={<PlaceIcon />}
              href={mapLink(navigationTarget.address)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Navigate to {canNavigateToPickup ? 'Pickup' : 'Dropoff'}
            </Button>
            {isCurrent && onUpdate && (
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => setUpdateModalOpen(true)}
              >
                Update Status
              </Button>
            )}
          </Stack>
        </Box>
      </Card>
      <ContactInfoModal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        rider={primaryRider || undefined}
      />
      {isCurrent && (
        <UpdateStatusModal
          open={updateModalOpen}
          onClose={() => setUpdateModalOpen(false)}
          currentStatus={status}
          nextStatuses={allStatuses}
          onUpdate={async (newStatus) => {
            await handleStatusUpdate(newStatus);
            setUpdateModalOpen(false);
          }}
          updating={!!updating}
        />
      )}
    </>
  );
};

const Rides = () => {
  const { scheduledRides, refreshRides, refreshRidesByUser, updateRideStatus } =
    useRides();
  const { curDate } = useDate();
  const authContext = useContext(AuthContext);
  const [updating, setUpdating] = useState(false);
  const [currentRideId, setCurrentRideId] = useState<string | null>(null);
  const [allDriverRides, setAllDriverRides] = useState<Ride[]>([]);
  const [loadingRides, setLoadingRides] = useState(false);

  // Fetch all driver rides on component mount
  useEffect(() => {
    const fetchDriverRides = async () => {
      if (authContext.id) {
        setLoadingRides(true);
        try {
          const rides = await refreshRidesByUser(authContext.id, 'driver');
          setAllDriverRides(rides);
        } catch (error) {
          console.error('Failed to fetch driver rides:', error);
        } finally {
          setLoadingRides(false);
        }
      }
    };

    fetchDriverRides();
  }, [authContext.id, refreshRidesByUser]);

  // Get today's rides for current/next ride calculations
  const todaysRides = useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    return allDriverRides.filter((ride) => {
      const s = new Date(ride.startTime).getTime();
      return s >= startOfDay.getTime() && s <= endOfDay.getTime();
    });
  }, [allDriverRides]);

  const filteredRides = useMemo(() => {
    // Show all rides assigned to this driver (across all dates)
    return allDriverRides.filter((ride) => ride.driver?.id === authContext.id);
  }, [allDriverRides, authContext.id]);

  const nextDriverRide = useMemo(() => {
    return todaysRides
      .filter(
        (ride) =>
          ride.driver?.id === authContext.id &&
          new Date(ride.startTime) > new Date() &&
          ride.status !== Status.CANCELLED
      )
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )[0];
  }, [todaysRides, authContext.id]);

  const currentRide: Ride | undefined = useMemo(() => {
    const now = Date.now();
    const mine = todaysRides.filter((r) => r.driver?.id === authContext.id);
    return mine.find((r) => {
      const start = new Date(r.startTime).getTime();
      const end = new Date(r.endTime).getTime();
      return (
        start <= now &&
        now <= end &&
        r.status !== Status.COMPLETED &&
        r.status !== Status.CANCELLED
      );
    });
  }, [todaysRides, authContext.id]);

  useEffect(() => {
    setCurrentRideId(currentRide ? currentRide.id : null);
  }, [currentRide]);

  const updateStatus = async (rideId: string, status: Status) => {
    try {
      setUpdating(true);
      // Use optimistic update from context
      await updateRideStatus(rideId, status);
    } catch (error: any) {
      console.error('Failed to update ride status:', error);
      const errorMessage =
        error.response?.data?.message ||
        'Could not update ride status. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    document.title = 'Rides - Carriage';
  }, []);

  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string}>
      <main id="main">
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h4" component="h1">
              My Rides
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<DownloadIcon />}>
                Export
              </Button>
              <Button variant="outlined" startIcon={<EmailIcon />}>
                Send Email
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ mb: 3 }} alignItems="stretch">
            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
              <RideDetailCard
                ride={currentRide}
                isCurrent={true}
                updating={updating}
                onUpdate={updateStatus}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
              <RideDetailCard ride={nextDriverRide} isCurrent={false} />
            </Grid>
          </Grid>

          <RideTable rides={filteredRides} userRole="driver" />
        </Box>
      </main>
    </APIProvider>
  );
};

export default Rides;
