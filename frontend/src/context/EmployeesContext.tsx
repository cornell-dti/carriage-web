import React, { useState } from 'react';
import { Admin, Driver } from '../types';
import { useReq } from './req';


type employeesState = {
  drivers: Array<Driver>,
  admins: Array<Admin>,
  refreshDrivers: () => Promise<void>,
  refreshAdmins: () => Promise<void>
};

const initialState: employeesState = {
  drivers: [],
  admins: [],
  refreshDrivers: async () => undefined,
  refreshAdmins: async () => undefined,
};
const EmployeesContext = React.createContext(initialState);
export const useEmployees = () => React.useContext(EmployeesContext);

type EmployeesProviderProps = {
  children: React.ReactNode;
}

export const EmployeesProvider = ({ children }: EmployeesProviderProps) => {
  const [drivers, setDrivers] = useState<Array<Driver>>([]);
  const [admins, setAdmins] = useState<Array<Admin>>([]);
  const { withDefaults } = useReq();

  const refreshDrivers = async () => {
    const driversData: Array<Driver> = await fetch('/api/drivers', withDefaults())
      .then((res) => res.json())
      .then((data) => data.data);
    setDrivers([...driversData]);
  };

  const refreshAdmins = async () => {
    const adminsData: Array<Admin> = await fetch('/api/admins', withDefaults())
      .then((res) => res.json())
      .then((data) => data.data);
    setAdmins([...adminsData]);
  };

  // Initialize the data
  React.useEffect(() => {
    refreshDrivers();
    refreshAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <EmployeesContext.Provider
      value={{
        drivers,
        admins,
        refreshDrivers,
        refreshAdmins
      }}
    >
      {children}
    </EmployeesContext.Provider>
  );
};
