import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button } from '@mui/material';
import { Ride, SchedulingState, Status } from '../../types';
import AuthContext from '../../context/auth';
import styles from './page.module.css';
import { FormData } from 'components/RiderComponents/RequestRideDialog';
import RequestRideDialog from 'components/RiderComponents/RequestRideDialog';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useLocations } from '../../context/LocationsContext';
import { useRides } from '../../context/RidesContext';
import axios from '../../util/axios';
import ResponsiveRideCard from '../../components/ResponsiveRideCard';
import { RideDetailsComponent } from 'components/RideDetails';
import buttonStyles from '../../components/ResponsiveRideCard.module.css';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

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
  const { refreshRides, refreshRidesByUser } = useRides();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allRiderRides, setAllRiderRides] = useState<Ride[]>([]);
  const [loadingRides, setLoadingRides] = useState(false);

  const [editingRide, setEditingRide] = useState<null | Ride>(null);

  // Get the start of the current week (Sunday in local timezone)
  const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Sunday is 0
    const startOfWeek = new Date(d.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  };

  const [weekStartDate, setWeekStartDate] = useState<Date>(() =>
    getStartOfWeek(new Date())
  );

  const handleDateChange = (newValue: Date | null) => {
    if (newValue) {
      setWeekStartDate(getStartOfWeek(newValue));
    }
  };

  // Calculate end of week
  const getEndOfWeek = (startDate: Date): Date => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    endDate.setHours(0, 0, 0, 0);
    return endDate;
  };

  const goToPreviousWeek = () => {
    setWeekStartDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const goToNextWeek = () => {
    setWeekStartDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
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

  const rideDayMap: DayRideCollection = useMemo(() => {
    const weekEnd = getEndOfWeek(weekStartDate);
    const ridesInWeek = allRides.filter((ride) => {
      const rideDate = new Date(ride.startTime);
      return rideDate >= weekStartDate && rideDate < weekEnd;
    });
    return partitionRides(ridesInWeek);
  }, [allRides, weekStartDate]);

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
            gap: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              fontSize: '1rem',
              alignItems: 'center',
            }}
          >
            <button
              onClick={goToPreviousWeek}
              className={`${buttonStyles.button} ${buttonStyles.buttonSecondary}`}
              style={{ width: '3rem', height: '2.5rem' }}
              aria-label="Previous Week"
              aria-hidden="true"
            >
              <NavigateBefore></NavigateBefore>
            </button>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Week of"
                value={weekStartDate}
                onAccept={handleDateChange}
                slotProps={{
                  textField: {
                    sx: {
                      width: '14rem',
                      '& .MuiInputBase-root': {
                        height: '2.5rem',
                      },
                      '& .MuiInputBase-input': {
                        padding: '0.5rem',
                        paddingX: '1rem',
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#ddd',
                          transition: 'border 0.1s',
                        },
                      },
                    },
                    onBlur: (e) => {
                      const inputValue = e.target.value;
                      if (inputValue) {
                        const parsedDate = new Date(inputValue);
                        if (!isNaN(parsedDate.getTime())) {
                          handleDateChange(parsedDate);
                        }
                      }
                    },
                  },
                  popper: {
                    sx: {
                      '& .MuiPaper-root': {
                        border: '1px solid #ddd',
                        boxShadow: 'none',
                      },
                      '& .MuiPickersDay-root': {
                        '&.Mui-selected': {
                          backgroundColor: '#333',
                          '&:hover': {
                            backgroundColor: '#444',
                          },
                        },
                      },
                      '& .MuiDayCalendar-weekContainer': {
                        '&:has(.Mui-selected)': {
                          backgroundColor: '#f5f5f5',
                        },
                      },
                    },
                  },
                }}
                format="MM/dd/yyyy"
              />
            </LocalizationProvider>
            <button
              onClick={goToNextWeek}
              className={`${buttonStyles.button} ${buttonStyles.buttonSecondary}`}
              style={{ width: '3rem', height: '2.5rem' }}
              aria-label="Next Week"
              aria-hidden="true"
            >
              <NavigateNext></NavigateNext>
            </button>
          </div>

          {rideDayMap.length > 0 ? (
            rideDayMap.map(([day, rides]) => {
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
                      fontSize: '1rem',
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
            })
          ) : (
            <div
              style={{
                width: '16rem',
                height: '4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '#ddd 1px solid',
                borderRadius: '0.25rem',
              }}
            >
              <p
                style={{
                  width: 'min-content',
                  textWrap: 'nowrap',
                }}
              >
                {loadingRides ? 'Loading Rides...' : 'No rides this week'}
              </p>
            </div>
          )}
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
