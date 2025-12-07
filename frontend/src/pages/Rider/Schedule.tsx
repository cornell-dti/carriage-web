import React, { FC, useContext, useEffect, useState } from 'react';
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
import { Place, SubdirectoryArrowRight, WatchLater } from '@mui/icons-material';

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

interface RideCardProps {
  ride: Ride;
  handleEdit: (rideToEdit: Ride) => any;
}

const RideCardComponent: FC<RideCardProps> = ({ ride, handleEdit }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  console.log(ride);
  return (
    <button
      onClick={() => setExpanded(!expanded)}
      style={{
        width: '100%',
        height: 'min-content',
        maxWidth: '32rem',
        background: 'white',
        borderRadius: '0.25rem',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        border: '#dddddd 1px solid',
        cursor: 'pointer',
      }}
    >
      {/* ride status, check if scheduled. If not, display card indicating */}
      {ride.schedulingState === SchedulingState.UNSCHEDULED ? (
        <div
          style={{
            width: '100%',
            height: 'min-content',
            borderRadius: '0.1275rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#707070',
          }}
        >
          <p>Requested</p>
        </div>
      ) : ride.status === Status.CANCELLED ? (
        <div
          style={{
            width: '100%',
            height: 'min-content',
            borderRadius: '0.1275rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff0f0',
            color: '#c10000',
          }}
        >
          <p>Canceled</p>
        </div>
      ) : (
        <></>
      )}
      <div
        style={{
          width: '100%',
          height: 'min-content',
          display: 'flex',
          flexDirection: expanded ? 'column' : 'row',
          justifyContent: expanded ? 'normal' : 'space-between',
          gap: expanded ? 'auto' : '1.5rem',
          textWrap: 'nowrap',
        }}
      >
        {/* time-related */}
        <div
          style={{
            width: 'min-content',
            height: 'min-content',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <span
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            <WatchLater></WatchLater>
            <p>{ride.startTime}</p>
          </span>
          <span
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              color: '#707070',
            }}
          >
            <SubdirectoryArrowRight></SubdirectoryArrowRight>
            <p>{ride.endTime}</p>
          </span>
        </div>
        {/* location-related */}
        {!expanded && (
          <div
            style={{
              width: '8rem',
              height: 'min-content',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
              }}
            >
              <Place></Place>
              <p>{ride.startLocation.shortName}</p>
            </span>
            <span
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                color: '#707070',
              }}
            >
              <SubdirectoryArrowRight></SubdirectoryArrowRight>
              <p>{ride.endLocation.shortName}</p>
            </span>
          </div>
        )}
        {/* expanded location view */}
        {expanded && (
          <div
            style={{
              width: '100%',
              height: 'min-content',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            {/* start location + map */}
            <div
              style={{
                width: 'flex-1',
                height: 'min-content',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}
              >
                <Place></Place>
                <p>{ride.startLocation.shortName}</p>
              </span>

              {/* map placeholder */}
              <div
                style={{
                  width: '100%',
                  height: '32rem',
                  background: '#8888ff',
                }}
              ></div>
            </div>
            {/* end location + map */}
            <div
              style={{
                width: 'flex-1',
                height: 'min-content',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                  color: '#707070',
                }}
              >
                <SubdirectoryArrowRight></SubdirectoryArrowRight>
                <p>{ride.endLocation.shortName}</p>
              </span>

              {/* map placeholder */}
              <div
                style={{
                  width: '100%',
                  height: '32rem',
                  background: '#8888ff',
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
      {/* expanded buttons */}
      {expanded && (
        <div
          style={{
            width: '100%',
            height: 'min-content',
            display: 'flex',
            gap: '0.5rem',
          }}
        >
          <button
            style={{
              width: '100%',
              height: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '#707070 1px solid',
              borderRadius: '0.25rem',
            }}
          >
            Close
          </button>
          <button
            style={{
              width: '100%',
              height: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '#303030 1px solid',
              borderRadius: '0.25rem',
              backgroundColor: '#000',
              color: '#fff',
            }}
          >
            Edit
          </button>
        </div>
      )}
    </button>
  );
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

  const { refreshLocations } = useLocations();


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
                No rides this week
              </p>
            </div>
          )}
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
          refreshLocations={refreshLocations}
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
