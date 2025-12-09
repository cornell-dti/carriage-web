import React, { useCallback, useState, useRef } from 'react';
import { RiderType } from '@carriage-web/shared/src/types/rider';
import axios from '../util/axios';

type ridersState = {
  riders: Array<RiderType>;
  refreshRiders: () => Promise<void>;
  loading: boolean;
  isOptimistic: boolean;
  pendingOperations: any[];
  updateRiderActive: (riderId: string, active: boolean) => Promise<void>;
  updateRiderInfo: (
    riderId: string,
    updates: Partial<RiderType>
  ) => Promise<void>;
  createRider: (rider: Omit<RiderType, 'id'>) => Promise<void>;
  deleteRider: (riderId: string) => Promise<void>;
  getRiderById: (riderId: string) => RiderType | undefined;
  clearError: () => void;
  error: Error | null;
};

const initialState: ridersState = {
  riders: [],
  refreshRiders: async () => undefined,
  loading: true,
  isOptimistic: false,
  pendingOperations: [],
  updateRiderActive: async () => undefined,
  updateRiderInfo: async () => undefined,
  createRider: async () => undefined,
  deleteRider: async () => undefined,
  getRiderById: () => undefined,
  clearError: () => undefined,
  error: null,
};
const RidersContext = React.createContext(initialState);
export const useRiders = () => React.useContext(RidersContext);

type RidersProviderProps = {
  children: React.ReactNode;
};

export const RidersProvider = ({ children }: RidersProviderProps) => {
  const componentMounted = useRef(true);
  const [riders, setRiders] = useState<Array<RiderType>>([]);
  const [loading, setLoading] = useState(true);

  const refreshRiders = useCallback(async () => {
    setLoading(true);
    try {
      const ridersData: Array<RiderType> = await axios
        .get('/api/riders')
        .then((res) => res.data)
        .then((data) => data.data);

      if (ridersData && componentMounted.current) {
        ridersData.sort((a: RiderType, b: RiderType) => {
          const aFull = `${a.firstName} ${a.lastName}`.toLowerCase();
          const bFull = `${b.firstName} ${b.lastName}`.toLowerCase();
          return aFull < bFull ? -1 : 1;
        });
        setRiders(ridersData);
      }
    } catch (error) {
      console.error('Failed to fetch riders:', error);
    } finally {
      if (componentMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  const updateRiderActive = useCallback(
    async (riderId: string, active: boolean) => {
      try {
        // Optimistic update
        setRiders((prevRiders) =>
          prevRiders.map((rider) =>
            rider.id === riderId ? { ...rider, active } : rider
          )
        );

        // Make API call
        await axios.put(`/api/riders/${riderId}`, { active });
      } catch (error) {
        // Rollback on error
        console.error('Failed to update rider active status:', error);
        await refreshRiders(); // Refresh to get server state
        throw error;
      }
    },
    [refreshRiders]
  );

  const updateRiderInfo = useCallback(
    async (riderId: string, updates: Partial<RiderType>) => {
      const originalRiders = [...riders];
      try {
        // Optimistic update
        setRiders((prevRiders) =>
          prevRiders.map((rider) =>
            rider.id === riderId ? { ...rider, ...updates } : rider
          )
        );

        // Make API call
        const response = await axios.put(`/api/riders/${riderId}`, updates);
        const serverRider = response.data.data;

        // Update with server data
        setRiders((prevRiders) =>
          prevRiders.map((rider) =>
            rider.id === riderId ? serverRider : rider
          )
        );
      } catch (error) {
        // Rollback on error
        console.error('Failed to update rider info:', error);
        setRiders(originalRiders);
        throw error;
      }
    },
    [riders]
  );

  const createRider = useCallback(async (rider: Omit<RiderType, 'id'>) => {
    const tempId = `temp-${Date.now()}`;
    const tempRider: RiderType = { ...rider, id: tempId };

    try {
      // Optimistic update
      setRiders((prevRiders) => [...prevRiders, tempRider]);

      // Make API call
      const response = await axios.post('/api/riders', rider);
      const serverRider = response.data.data;

      // Replace temp rider with server rider
      setRiders((prevRiders) =>
        prevRiders.map((r) => (r.id === tempId ? serverRider : r))
      );
    } catch (error) {
      // Rollback on error
      console.error('Failed to create rider:', error);
      setRiders((prevRiders) => prevRiders.filter((r) => r.id !== tempId));
      throw error;
    }
  }, []);

  const deleteRider = useCallback(
    async (riderId: string) => {
      const originalRiders = [...riders];
      try {
        // Optimistic update
        setRiders((prevRiders) =>
          prevRiders.filter((rider) => rider.id !== riderId)
        );

        // Make API call
        await axios.delete(`/api/riders/${riderId}`);
      } catch (error) {
        // Rollback on error
        console.error('Failed to delete rider:', error);
        setRiders(originalRiders);
        throw error;
      }
    },
    [riders]
  );

  const getRiderById = useCallback(
    (riderId: string): RiderType | undefined => {
      return riders.find((rider) => rider.id === riderId);
    },
    [riders]
  );

  React.useEffect(() => {
    refreshRiders();

    return () => {
      componentMounted.current = false;
    };
  }, [refreshRiders]);

  return (
    <RidersContext.Provider
      value={{
        riders,
        refreshRiders,
        loading,
        isOptimistic: false, // Simplified for now
        pendingOperations: [],
        updateRiderActive,
        updateRiderInfo,
        createRider,
        deleteRider,
        getRiderById,
        clearError: () => {},
        error: null,
      }}
    >
      {children}
    </RidersContext.Provider>
  );
};
