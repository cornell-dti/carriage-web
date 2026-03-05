import React, { useCallback, useRef, useState } from 'react';
import { Employee } from '../types';
import { AdminType } from '@carriage-web/shared/types/admin';
import { DriverType } from '@carriage-web/shared/types/driver';
import axios from '../util/axios';

type employeesState = {
  drivers: Array<DriverType>;
  admins: Array<AdminType>;
  loading: boolean;
  refreshDrivers: () => Promise<void>;
  refreshAdmins: () => Promise<void>;
  // Optimistic operations for drivers
  updateDriverInfo: (
    driverId: string,
    updates: Partial<DriverType>
  ) => Promise<void>;
  createDriver: (driver: Omit<DriverType, 'id'>) => Promise<void>;
  deleteDriver: (driverId: string) => Promise<void>;
  // Optimistic operations for admins
  updateAdminInfo: (
    adminId: string,
    updates: Partial<AdminType>
  ) => Promise<void>;
  createAdmin: (admin: Omit<AdminType, 'id'>) => Promise<void>;
  deleteAdmin: (adminId: string) => Promise<void>;
  // Helper functions
  getDriverById: (driverId: string) => DriverType | undefined;
  getAdminById: (adminId: string) => AdminType | undefined;
  // Error handling
  clearError: () => void;
  error: Error | null;
};

const initialState: employeesState = {
  drivers: [],
  admins: [],
  loading: true,
  refreshDrivers: async () => undefined,
  refreshAdmins: async () => undefined,
  updateDriverInfo: async () => undefined,
  createDriver: async () => undefined,
  deleteDriver: async () => undefined,
  updateAdminInfo: async () => undefined,
  createAdmin: async () => undefined,
  deleteAdmin: async () => undefined,
  getDriverById: () => undefined,
  getAdminById: () => undefined,
  clearError: () => undefined,
  error: null,
};

const EmployeesContext = React.createContext(initialState);
export const useEmployees = () => React.useContext(EmployeesContext);

type EmployeesProviderProps = {
  children: React.ReactNode;
};

const sortByName = (
  a: { firstName: string; lastName: string },
  b: { firstName: string; lastName: string }
) => {
  const aFull = `${a.firstName} ${a.lastName}`.toLowerCase();
  const bFull = `${b.firstName} ${b.lastName}`.toLowerCase();
  return aFull < bFull ? -1 : 1;
};

export const EmployeesProvider = ({ children }: EmployeesProviderProps) => {
  const componentMounted = useRef(true);
  const [drivers, setDrivers] = useState<Array<DriverType>>([]);
  const [admins, setAdmins] = useState<Array<AdminType>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshDrivers = useCallback(async () => {
    try {
      const driversData: Array<DriverType> = await axios
        .get('/api/drivers')
        .then((res) => res.data)
        .then((data) => data.data);

      driversData?.sort(sortByName);
      componentMounted.current && setDrivers(driversData);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      setError(error as Error);
    }
  }, []);

  const refreshAdmins = useCallback(async () => {
    try {
      const adminsData: Array<AdminType> = await axios
        .get('/api/admins')
        .then((res) => res.data)
        .then((data) => data.data);

      adminsData?.sort(sortByName);
      componentMounted.current && setAdmins(adminsData);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      setError(error as Error);
    }
  }, []);

  // Optimistic Driver Operations
  const updateDriverInfo = useCallback(
    async (driverId: string, updates: Partial<DriverType>) => {
      const originalDrivers = [...drivers];
      try {
        // Optimistic update
        setDrivers((prevDrivers) =>
          prevDrivers
            .map((driver) =>
              driver.id === driverId ? { ...driver, ...updates } : driver
            )
            .sort(sortByName)
        );

        // Make API call
        const response = await axios.put(`/api/drivers/${driverId}`, updates);
        const serverDriver = response.data.data;

        // Update with server data
        setDrivers((prevDrivers) =>
          prevDrivers
            .map((driver) => (driver.id === driverId ? serverDriver : driver))
            .sort(sortByName)
        );
      } catch (error) {
        // Rollback on error
        console.error('Failed to update driver info:', error);
        setDrivers(originalDrivers);
        setError(error as Error);
        throw error;
      }
    },
    [drivers]
  );

  const createDriver = useCallback(async (driver: Omit<DriverType, 'id'>) => {
    const tempId = `temp-driver-${Date.now()}`;
    const tempDriver: DriverType = { ...driver, id: tempId };

    try {
      // Optimistic update
      setDrivers((prevDrivers) =>
        [...prevDrivers, tempDriver].sort(sortByName)
      );

      // Make API call
      const response = await axios.post('/api/drivers', driver);
      const serverDriver = response.data.data;

      // Replace temp driver with server driver
      setDrivers((prevDrivers) =>
        prevDrivers
          .map((d) => (d.id === tempId ? serverDriver : d))
          .sort(sortByName)
      );
    } catch (error) {
      // Rollback on error
      console.error('Failed to create driver:', error);
      setDrivers((prevDrivers) => prevDrivers.filter((d) => d.id !== tempId));
      setError(error as Error);
      throw error;
    }
  }, []);

  const deleteDriver = useCallback(
    async (driverId: string) => {
      const originalDrivers = [...drivers];
      try {
        // Optimistic update
        setDrivers((prevDrivers) =>
          prevDrivers.filter((driver) => driver.id !== driverId)
        );

        // Make API call
        await axios.delete(`/api/drivers/${driverId}`);
      } catch (error) {
        // Rollback on error
        console.error('Failed to delete driver:', error);
        setDrivers(originalDrivers);
        setError(error as Error);
        throw error;
      }
    },
    [drivers]
  );

  // Optimistic Admin Operations
  const updateAdminInfo = useCallback(
    async (adminId: string, updates: Partial<AdminType>) => {
      const originalAdmins = [...admins];
      try {
        // Optimistic update
        setAdmins((prevAdmins) =>
          prevAdmins
            .map((admin) =>
              admin.id === adminId ? { ...admin, ...updates } : admin
            )
            .sort(sortByName)
        );

        // Make API call
        const response = await axios.put(`/api/admins/${adminId}`, updates);
        const serverAdmin = response.data.data;

        // Update with server data
        setAdmins((prevAdmins) =>
          prevAdmins
            .map((admin) => (admin.id === adminId ? serverAdmin : admin))
            .sort(sortByName)
        );
      } catch (error) {
        // Rollback on error
        console.error('Failed to update admin info:', error);
        setAdmins(originalAdmins);
        setError(error as Error);
        throw error;
      }
    },
    [admins]
  );

  const createAdmin = useCallback(async (admin: Omit<AdminType, 'id'>) => {
    const tempId = `temp-admin-${Date.now()}`;
    const tempAdmin: AdminType = { ...admin, id: tempId };

    try {
      // Optimistic update
      setAdmins((prevAdmins) => [...prevAdmins, tempAdmin].sort(sortByName));

      // Make API call
      const response = await axios.post('/api/admins', admin);
      const serverAdmin = response.data.data;

      // Replace temp admin with server admin
      setAdmins((prevAdmins) =>
        prevAdmins
          .map((a) => (a.id === tempId ? serverAdmin : a))
          .sort(sortByName)
      );
    } catch (error) {
      // Rollback on error
      console.error('Failed to create admin:', error);
      setAdmins((prevAdmins) => prevAdmins.filter((a) => a.id !== tempId));
      setError(error as Error);
      throw error;
    }
  }, []);

  const deleteAdmin = useCallback(
    async (adminId: string) => {
      const originalAdmins = [...admins];
      try {
        // Optimistic update
        setAdmins((prevAdmins) =>
          prevAdmins.filter((admin) => admin.id !== adminId)
        );

        // Make API call
        await axios.delete(`/api/admins/${adminId}`);
      } catch (error) {
        // Rollback on error
        console.error('Failed to delete admin:', error);
        setAdmins(originalAdmins);
        setError(error as Error);
        throw error;
      }
    },
    [admins]
  );

  // Helper Functions
  const getDriverById = useCallback(
    (driverId: string): DriverType | undefined => {
      return drivers.find((driver) => driver.id === driverId);
    },
    [drivers]
  );

  const getAdminById = useCallback(
    (adminId: string): AdminType | undefined => {
      return admins.find((admin) => admin.id === adminId);
    },
    [admins]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize the data
  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([refreshDrivers(), refreshAdmins()]);
      if (componentMounted.current) {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      componentMounted.current = false;
    };
  }, [refreshAdmins, refreshDrivers]);

  return (
    <EmployeesContext.Provider
      value={{
        drivers,
        admins,
        loading,
        refreshDrivers,
        refreshAdmins,
        updateDriverInfo,
        createDriver,
        deleteDriver,
        updateAdminInfo,
        createAdmin,
        deleteAdmin,
        getDriverById,
        getAdminById,
        clearError,
        error,
      }}
    >
      {children}
    </EmployeesContext.Provider>
  );
};
