import React, { useState } from 'react';
import { Admin, Driver, Employee } from '../types';
import { useReq } from './req';


type employeesState = {
  // employees: Array<Employee>,
  // refreshEmployees: () => Promise<void>
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

// type driversState = {
//   drivers: Array<Driver>,
//   refreshDrivers: () => Promise<void>
// };

// type adminsState = {
//   admins: Array<Admin>,
//   refreshAdmins: () => Promise<void>
// };

// const driversInitialState: driversState = {
//   drivers: [],
//   refreshDrivers: async () => undefined,
// };

// const adminsInitialState: adminsState = {
//   admins: [],
//   refreshAdmins: async () => undefined,
// };

// const DriversContext = React.createContext(driversInitialState);
// const AdminsContext = React.createContext(adminsInitialState);

// export const useDrivers = () => React.useContext(DriversContext);
// export const useAdmins = () => React.useContext(AdminsContext);

type EmployeesProviderProps = {
  children: React.ReactNode;
}

export const EmployeesProvider = ({ children }: EmployeesProviderProps) => {
  // const [employees, setEmployees] = useState<Array<Employee>>([]);
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
    // const employeesData = adminsData.concat(driversData);
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
