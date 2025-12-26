import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Ride, SchedulingState, Status, Rider } from '../types';
import { useDate } from './date';
import { format_date } from '../util/index';
import axios from '../util/axios';
import { useErrorModal, formatErrorMessage } from './errorModal';

type ridesState = {
  unscheduledRides: Ride[];
  scheduledRides: Ride[];
  loading: boolean;
  refreshRides: () => Promise<void>;
  refreshRidesByUser: (
    userId: string,
    userType: 'rider' | 'driver'
  ) => Promise<Ride[]>;
  // Optimistic ride operations
  updateRideStatus: (rideId: string, status: Status) => Promise<void>;
  updateRideScheduling: (
    rideId: string,
    schedulingState: SchedulingState,
    driverId?: string
  ) => Promise<void>;
  assignDriver: (rideId: string, driverId: string) => Promise<void>;
  updateRideInfo: (rideId: string, updates: Partial<Ride>) => Promise<void>;
  createRide: (ride: Omit<Ride, 'id'>) => Promise<void>;
  cancelRide: (rideId: string) => Promise<void>;
  deleteRide: (rideId: string) => Promise<void>;
  // Helper functions
  getRideById: (rideId: string) => Ride | undefined;
  getAllRides: () => Ride[];
  // Available riders functions
  getAvailableRiders: (startTime: string, endTime: string) => Promise<Rider[]>;
  // Error handling
  clearError: () => void;
  error: Error | null;
};

const initialState: ridesState = {
  unscheduledRides: [],
  scheduledRides: [],
  loading: true,
  refreshRides: async () => {},
  refreshRidesByUser: async () => [],
  updateRideStatus: async () => undefined,
  updateRideScheduling: async () => undefined,
  assignDriver: async () => undefined,
  updateRideInfo: async () => undefined,
  createRide: async () => undefined,
  cancelRide: async () => undefined,
  deleteRide: async () => undefined,
  getRideById: () => undefined,
  getAllRides: () => [],
  getAvailableRiders: async () => [],
  clearError: () => undefined,
  error: null,
};

const RidesContext = React.createContext(initialState);
export const useRides = () => React.useContext(RidesContext);

type RidesProviderProps = {
  children: React.ReactNode;
};

export const RidesProvider = ({ children }: RidesProviderProps) => {
  const [unscheduledRides, setUnscheduledRides] = useState<Ride[]>([]);
  const [scheduledRides, setScheduledRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { curDate } = useDate();
  const { showError } = useErrorModal();

  const refreshRides = useCallback(async () => {
    const formattedDate = format_date(curDate);
    setLoading(true);
    try {
      // Fetch rides filtered by the selected date
      const response = await axios.get(`/api/rides?date=${formattedDate}`);

      const ridesData: Ride[] = response.data.data;

      if (ridesData) {
        const unscheduled = ridesData.filter(
          ({ schedulingState }) =>
            schedulingState === SchedulingState.UNSCHEDULED
        );
        const scheduled = ridesData.filter(
          ({ schedulingState }) => schedulingState === SchedulingState.SCHEDULED
        );

        setUnscheduledRides(unscheduled);
        setScheduledRides(scheduled);
      }
    } catch (error) {
      console.error('Error refreshing rides:', error);
      setError(error as Error);
      showError(`Error refreshing rides: ${formatErrorMessage(error)}`, 'Rides Error');
    } finally {
      setLoading(false);
    }
  }, [curDate]);

  const refreshRidesByUser = useCallback(
    async (userId: string, userType: 'rider' | 'driver'): Promise<Ride[]> => {
      try {
        // Fetch all rides for the user across all dates
        const queryParam = userType === 'rider' ? 'rider' : 'driver';
        const response = await axios.get(
          `/api/rides?${queryParam}=${userId}&allDates=true`
        );

        const ridesData: Ride[] = response.data.data || [];

        return ridesData;
      } catch (error) {
        console.error(`Error refreshing ${userType} rides:`, error);
        return [];
      }
    },
    []
  );

  // Helper functions to manage ride state
  const updateRideInLists = (
    rideId: string,
    updateFn: (ride: Ride) => Ride
  ) => {
    setUnscheduledRides((prev) =>
      prev.map((ride) => (ride.id === rideId ? updateFn(ride) : ride))
    );
    setScheduledRides((prev) =>
      prev.map((ride) => (ride.id === rideId ? updateFn(ride) : ride))
    );
  };

  const moveRideBetweenLists = (
    rideId: string,
    fromScheduled: boolean,
    toScheduled: boolean,
    updateFn?: (ride: Ride) => Ride
  ) => {
    if (fromScheduled === toScheduled) {
      // Same list, just update
      if (updateFn) {
        updateRideInLists(rideId, updateFn);
      }
      return;
    }

    // Moving between lists
    const sourceList = fromScheduled ? scheduledRides : unscheduledRides;
    const setTargetList = toScheduled ? setScheduledRides : setUnscheduledRides;
    const setSourceList = fromScheduled
      ? setScheduledRides
      : setUnscheduledRides;

    const rideToMove = sourceList.find((ride) => ride.id === rideId);
    if (!rideToMove) return;

    const updatedRide = updateFn ? updateFn(rideToMove) : rideToMove;

    // Remove from source list
    setSourceList((prev) => prev.filter((ride) => ride.id !== rideId));
    // Add to target list
    setTargetList((prev) => [...prev, updatedRide]);
  };

  const getRideById = useCallback(
    (rideId: string): Ride | undefined => {
      const allRides = [...unscheduledRides, ...scheduledRides];
      allRides.forEach((ride, index) => {});
      const foundRide = allRides.find((ride) => ride.id === rideId);
      return foundRide;
    },
    [unscheduledRides, scheduledRides]
  );

  const getAllRides = useCallback((): Ride[] => {
    return [...unscheduledRides, ...scheduledRides];
  }, [unscheduledRides, scheduledRides]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Optimistic ride operations
  const updateRideStatus = useCallback(
    async (rideId: string, status: Status) => {
      const originalRide = getRideById(rideId);
      if (!originalRide) {
        throw new Error('Ride not found');
      }

      try {
        // Optimistic update
        updateRideInLists(rideId, (ride) => ({ ...ride, status }));

        // Make API call
        await axios.put(`/api/rides/${rideId}`, { status });
      } catch (error) {
        // Rollback on error
        console.error('Failed to update ride status:', error);
        if (originalRide) {
          updateRideInLists(rideId, () => originalRide);
        }
        setError(error as Error);
        showError(`Failed to update ride status: ${formatErrorMessage(error)}`, 'Rides Error');
        throw error;
      }
    },
    [getRideById]
  );

  const updateRideScheduling = useCallback(
    async (
      rideId: string,
      schedulingState: SchedulingState,
      driverId?: string
    ) => {
      const originalRide = getRideById(rideId);
      if (!originalRide) {
        throw new Error('Ride not found');
      }

      const wasScheduled =
        originalRide.schedulingState === SchedulingState.SCHEDULED;
      const willBeScheduled = schedulingState === SchedulingState.SCHEDULED;

      try {
        // Optimistic update - move between lists if needed
        moveRideBetweenLists(rideId, wasScheduled, willBeScheduled, (ride) => ({
          ...ride,
          schedulingState,
          ...(driverId && { driver: { ...ride.driver, id: driverId } as any }),
        }));

        // Make API call
        const updateData: any = { schedulingState };
        if (driverId) {
          updateData.driverId = driverId;
        }
        await axios.put(`/api/rides/${rideId}`, updateData);
      } catch (error) {
        // Rollback on error
        console.error('Failed to update ride scheduling:', error);
        if (originalRide) {
          // Restore original ride in original list
          moveRideBetweenLists(
            rideId,
            willBeScheduled,
            wasScheduled,
            () => originalRide
          );
        }
        setError(error as Error);
        showError(`Failed to update ride scheduling: ${formatErrorMessage(error)}`, 'Rides Error');
        throw error;
      }
    },
    [getRideById, scheduledRides, unscheduledRides]
  );

  const assignDriver = useCallback(
    async (rideId: string, driverId: string) => {
      const originalRide = getRideById(rideId);
      if (!originalRide) {
        throw new Error('Ride not found');
      }

      try {
        // Optimistic update
        updateRideInLists(rideId, (ride) => ({
          ...ride,
          driver: { ...ride.driver, id: driverId } as any,
        }));

        // Make API call
        await axios.put(`/api/rides/${rideId}`, { driverId });
      } catch (error) {
        // Rollback on error
        console.error('Failed to assign driver:', error);
        if (originalRide) {
          updateRideInLists(rideId, () => originalRide);
        }
        setError(error as Error);
        showError(`Failed to assign driver: ${formatErrorMessage(error)}`, 'Rides Error');
        throw error;
      }
    },
    [getRideById]
  );

  const updateRideInfo = useCallback(
    async (rideId: string, updates: Partial<Ride>) => {
      let originalRide: Ride | undefined = getRideById(rideId);

      // If ride not found in current context, fetch it from the server first
      if (!originalRide) {
        try {
          const response = await axios.get(`/api/rides/${rideId}`);
          originalRide = response.data.data;

          // Don't add to context state since it's not from the current date
          // We'll just use it for the optimistic update logic
        } catch (error) {
          console.error('Failed to fetch ride from server:', error);
        const msg = 'Ride not found';
        showError(`${msg}: ${formatErrorMessage(error)}`, 'Rides Error');
        throw new Error(msg);
        }
      }

      // At this point originalRide should definitely exist, but add type guard for safety
      if (!originalRide) {
        throw new Error('Failed to get ride data');
      }

      const wasScheduled =
        originalRide.schedulingState === SchedulingState.SCHEDULED;
      const willBeScheduled =
        (updates.schedulingState || originalRide.schedulingState) ===
        SchedulingState.SCHEDULED;

      try {
        // Check if ride is in current context for optimistic updates
        const rideInContext = getRideById(rideId);

        if (rideInContext) {
          // Optimistic update for rides in current context
          if (wasScheduled === willBeScheduled) {
            updateRideInLists(rideId, (ride) => ({ ...ride, ...updates }));
          } else {
            moveRideBetweenLists(
              rideId,
              wasScheduled,
              willBeScheduled,
              (ride) => ({ ...ride, ...updates })
            );
          }
        } else {
        }

        // Make API call
        const response = await axios.put(`/api/rides/${rideId}`, updates);
        const serverRide = response.data.data;
        console.log(serverRide, 'serverride');

        if (rideInContext) {
          // Update with server data if ride is in current context
          if (willBeScheduled) {
            setScheduledRides((prev) =>
              prev.map((ride) => (ride.id === rideId ? serverRide : ride))
            );
          } else {
            setUnscheduledRides((prev) =>
              prev.map((ride) => (ride.id === rideId ? serverRide : ride))
            );
          }
        }
      } catch (error) {
        // Rollback on error (only if ride was in context)
        console.error('Failed to update ride info:', error);
        const rideInContext = getRideById(rideId);
        if (originalRide && rideInContext) {
          moveRideBetweenLists(
            rideId,
            willBeScheduled,
            wasScheduled,
            () => originalRide as Ride
          );
        }
        setError(error as Error);
        showError(`Failed to update ride info: ${formatErrorMessage(error)}`, 'Rides Error');
        throw error;
      }
    },
    [getRideById, scheduledRides, unscheduledRides]
  );

  const createRide = useCallback(async (ride: Omit<Ride, 'id'>) => {
    const tempId = `temp-ride-${Date.now()}`;
    const tempRide: Ride = { ...ride, id: tempId };
    const isScheduled = ride.schedulingState === SchedulingState.SCHEDULED;

    try {
      // Optimistic update
      if (isScheduled) {
        setScheduledRides((prev) => [...prev, tempRide]);
      } else {
        setUnscheduledRides((prev) => [...prev, tempRide]);
      }

      // Make API call
      const response = await axios.post('/api/rides', ride);
      const serverRide = response.data.data;

      // Replace temp ride with server ride
      if (isScheduled) {
        setScheduledRides((prev) =>
          prev.map((r) => (r.id === tempId ? serverRide : r))
        );
      } else {
        setUnscheduledRides((prev) =>
          prev.map((r) => (r.id === tempId ? serverRide : r))
        );
      }
    } catch (error) {
      // Rollback on error
      console.error('Failed to create ride:', error);
      if (isScheduled) {
        setScheduledRides((prev) => prev.filter((r) => r.id !== tempId));
      } else {
        setUnscheduledRides((prev) => prev.filter((r) => r.id !== tempId));
      }
      setError(error as Error);
      showError(`Failed to create ride: ${formatErrorMessage(error)}`, 'Rides Error');
      throw error;
    }
  }, []);

  const deleteRide = useCallback(
    async (rideId: string) => {
      const originalRide = getRideById(rideId);
      if (!originalRide) {
        throw new Error('Ride not found');
      }

      const wasScheduled =
        originalRide.schedulingState === SchedulingState.SCHEDULED;

      try {
        // Optimistic update
        if (wasScheduled) {
          setScheduledRides((prev) =>
            prev.filter((ride) => ride.id !== rideId)
          );
        } else {
          setUnscheduledRides((prev) =>
            prev.filter((ride) => ride.id !== rideId)
          );
        }

        // Make API call
        await axios.delete(`/api/rides/${rideId}`);
      } catch (error) {
        // Rollback on error
        console.error('Failed to delete ride:', error);
        if (originalRide) {
          if (wasScheduled) {
            setScheduledRides((prev) => [...prev, originalRide]);
          } else {
            setUnscheduledRides((prev) => [...prev, originalRide]);
          }
        }
        setError(error as Error);
        showError(`Failed to delete ride: ${formatErrorMessage(error)}`, 'Rides Error');
        throw error;
      }
    },
    [getRideById]
  );

  const cancelRide = useCallback(
    async (rideId: string) => {
      // Cancelling a ride means deleting it from the database entirely
      const originalRide = getRideById(rideId);
      if (!originalRide) {
        throw new Error('Ride not found');
      }

      const wasScheduled =
        originalRide.schedulingState === SchedulingState.SCHEDULED;

      try {
        // Optimistic update
        if (wasScheduled) {
          setScheduledRides((prev) =>
            prev.filter((ride) => ride.id !== rideId)
          );
        } else {
          setUnscheduledRides((prev) =>
            prev.filter((ride) => ride.id !== rideId)
          );
        }

        // Make API call
        await axios.delete(`/api/rides/${rideId}`);
      } catch (error) {
        // Rollback on error
        console.error('Failed to cancel ride:', error);
        if (originalRide) {
          if (wasScheduled) {
            setScheduledRides((prev) => [...prev, originalRide]);
          } else {
            setUnscheduledRides((prev) => [...prev, originalRide]);
          }
        }
        setError(error as Error);
        showError(`Failed to cancel ride: ${formatErrorMessage(error)}`, 'Rides Error');
        throw error;
      }
    },
    [getRideById]
  );

  const getAvailableRiders = useCallback(
    async (startTime: string, endTime: string): Promise<Rider[]> => {
      try {
        // Fetch all riders
        const ridersResponse = await axios.get('/api/riders');
        const ridersData = ridersResponse.data?.data || ridersResponse.data;
        const allRiders = Array.isArray(ridersData) ? ridersData : [];

        // Fetch all rides for the same date to check for conflicts
        const startDate = new Date(startTime);
        const dateStr = startDate.toISOString().split('T')[0];

        const ridesResponse = await axios.get('/api/rides', {
          params: {
            date: dateStr,
            allDates: 'false',
          },
        });

        const ridesData = ridesResponse.data?.data || ridesResponse.data;
        const rides = Array.isArray(ridesData) ? ridesData : [];

        // Helper to check time overlap
        const overlaps = (rideStart: string, rideEnd: string) => {
          const reqStart = new Date(startTime).getTime();
          const reqEnd = new Date(endTime).getTime();
          const rideStartTime = new Date(rideStart).getTime();
          const rideEndTime = new Date(rideEnd).getTime();

          return !(rideEndTime <= reqStart || rideStartTime >= reqEnd);
        };

        // Find riders who have conflicting rides
        const conflictingRiderIds = new Set<string>();
        for (const ride of rides) {
          if (!ride.riders || !Array.isArray(ride.riders)) continue;

          // Check if this ride overlaps with the requested time window
          if (overlaps(ride.startTime, ride.endTime)) {
            // Mark all riders in this ride as conflicting
            for (const rider of ride.riders) {
              if (rider && rider.id) {
                conflictingRiderIds.add(rider.id);
              }
            }
          }
        }

        // Return riders who don't have any conflicting rides
        return allRiders.filter((rider) => !conflictingRiderIds.has(rider.id));
      } catch (error) {
        console.error('Failed to get available riders:', error);
        setError(error as Error);
        showError(`Failed to get available riders: ${formatErrorMessage(error)}`, 'Rides Error');
        throw error;
      }
    },
    []
  );

  useEffect(() => {
    refreshRides();
  }, [refreshRides]);

  return (
    <RidesContext.Provider
      value={{
        unscheduledRides,
        scheduledRides,
        loading,
        refreshRides,
        refreshRidesByUser,
        updateRideStatus,
        updateRideScheduling,
        assignDriver,
        updateRideInfo,
        createRide,
        cancelRide,
        deleteRide,
        getRideById,
        getAllRides,
        getAvailableRiders,
        clearError,
        error,
      }}
    >
      {children}
    </RidesContext.Provider>
  );
};
