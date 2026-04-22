import React, { useCallback, useRef, useState } from 'react';
import { EmployeeType } from '@carriage-web/shared/types/employee';
import axios from '../util/axios';

type employeesState = {
  drivers: EmployeeType[];
  admins: EmployeeType[];
  loading: boolean;
  refreshDrivers: () => Promise<void>;
  refreshAdmins: () => Promise<void>;
  updateDriverInfo: (
    driverId: string,
    updates: Partial<EmployeeType>
  ) => Promise<void>;
  createDriver: (driver: Omit<EmployeeType, 'id'>) => Promise<void>;
  deleteDriver: (driverId: string) => Promise<void>;
  updateAdminInfo: (
    adminId: string,
    updates: Partial<EmployeeType>
  ) => Promise<void>;
  createAdmin: (admin: Omit<EmployeeType, 'id'>) => Promise<void>;
  deleteAdmin: (adminId: string) => Promise<void>;
  getDriverById: (driverId: string) => EmployeeType | undefined;
  getAdminById: (adminId: string) => EmployeeType | undefined;
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
  const [drivers, setDrivers] = useState<EmployeeType[]>([]);
  const [admins, setAdmins] = useState<EmployeeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshDrivers = useCallback(async () => {
    try {
      const driversData: EmployeeType[] = await axios
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
      const adminsData: EmployeeType[] = await axios
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

  const updateDriverInfo = useCallback(
    async (driverId: string, updates: Partial<EmployeeType>) => {
      const originalDrivers = [...drivers];
      try {
        setDrivers((prevDrivers) =>
          prevDrivers
            .map((driver) =>
              driver.id === driverId ? { ...driver, ...updates } : driver
            )
            .sort(sortByName)
        );

        const response = await axios.put(`/api/drivers/${driverId}`, updates);
        const serverDriver = response.data.data;

        setDrivers((prevDrivers) =>
          prevDrivers
            .map((driver) => (driver.id === driverId ? serverDriver : driver))
            .sort(sortByName)
        );
      } catch (error) {
        console.error('Failed to update driver info:', error);
        setDrivers(originalDrivers);
        setError(error as Error);
        throw error;
      }
    },
    [drivers]
  );

  const createDriver = useCallback(async (driver: Omit<EmployeeType, 'id'>) => {
    const tempId = `temp-driver-${Date.now()}`;
    const tempDriver: EmployeeType = { ...driver, id: tempId };

    try {
      setDrivers((prevDrivers) =>
        [...prevDrivers, tempDriver].sort(sortByName)
      );

      const response = await axios.post('/api/drivers', driver);
      const serverDriver = response.data.data;

      setDrivers((prevDrivers) =>
        prevDrivers
          .map((d) => (d.id === tempId ? serverDriver : d))
          .sort(sortByName)
      );
    } catch (error) {
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
        setDrivers((prevDrivers) =>
          prevDrivers.filter((driver) => driver.id !== driverId)
        );

        await axios.delete(`/api/drivers/${driverId}`);
      } catch (error) {
        console.error('Failed to delete driver:', error);
        setDrivers(originalDrivers);
        setError(error as Error);
        throw error;
      }
    },
    [drivers]
  );

  const updateAdminInfo = useCallback(
    async (adminId: string, updates: Partial<EmployeeType>) => {
      const originalAdmins = [...admins];
      try {
        setAdmins((prevAdmins) =>
          prevAdmins
            .map((admin) =>
              admin.id === adminId ? { ...admin, ...updates } : admin
            )
            .sort(sortByName)
        );

        const response = await axios.put(`/api/admins/${adminId}`, updates);
        const serverAdmin = response.data.data;

        setAdmins((prevAdmins) =>
          prevAdmins
            .map((admin) => (admin.id === adminId ? serverAdmin : admin))
            .sort(sortByName)
        );
      } catch (error) {
        console.error('Failed to update admin info:', error);
        setAdmins(originalAdmins);
        setError(error as Error);
        throw error;
      }
    },
    [admins]
  );

  const createAdmin = useCallback(async (admin: Omit<EmployeeType, 'id'>) => {
    const tempId = `temp-admin-${Date.now()}`;
    const tempAdmin: EmployeeType = { ...admin, id: tempId };

    try {
      setAdmins((prevAdmins) => [...prevAdmins, tempAdmin].sort(sortByName));

      const response = await axios.post('/api/admins', admin);
      const serverAdmin = response.data.data;

      setAdmins((prevAdmins) =>
        prevAdmins
          .map((a) => (a.id === tempId ? serverAdmin : a))
          .sort(sortByName)
      );
    } catch (error) {
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
        setAdmins((prevAdmins) =>
          prevAdmins.filter((admin) => admin.id !== adminId)
        );

        await axios.delete(`/api/admins/${adminId}`);
      } catch (error) {
        console.error('Failed to delete admin:', error);
        setAdmins(originalAdmins);
        setError(error as Error);
        throw error;
      }
    },
    [admins]
  );

  const getDriverById = useCallback(
    (driverId: string): EmployeeType | undefined => {
      return drivers.find((driver) => driver.id === driverId);
    },
    [drivers]
  );

  const getAdminById = useCallback(
    (adminId: string): EmployeeType | undefined => {
      return admins.find((admin) => admin.id === adminId);
    },
    [admins]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
