import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import useSkipMain from '../../hooks/useSkipMain';
import Sidebar from '../../components/Sidebar/Sidebar';
import Employees from './Employees';
import Students from './Students';
import Home from './Home';
import Locations from './Locations';
import Analytics from './Analytics';
import EmployeeDetail from '../../components/UserDetail/EmployeeDetail';
import RiderDetail from '../../components/UserDetail/RiderDetail';
import ExportPreview from '../../components/ExportPreview/ExportPreview';
import DateContext from '../../context/date';
import { EmployeesProvider } from '../../context/EmployeesContext';
import { RidersProvider } from '../../context/RidersContext';
import { RidesProvider } from '../../context/RidesContext';
import { LocationsProvider } from '../../context/LocationsContext';

const RoutesComponent = () => {
  const skipRef = useSkipMain();
  return (
    <>
      <div tabIndex={-1} ref={skipRef}></div>
      <HashLink className="skip-main" to="#main">
        Skip to main content
      </HashLink>
      <Sidebar type="admin">
        <Routes>
          <Route path="/" element={<Navigate to="home" replace />} />
          <Route path="home" element={<Outlet />}>
            <Route index element={<Home />} />
            <Route path="export" element={<ExportPreview />} />
          </Route>
          <Route path="employees" element={<Employees />} />
          <Route path="admins/:id" element={<EmployeeDetail />} />
          <Route path="drivers/:id" element={<EmployeeDetail />} />
          <Route path="riders" element={<Students />} />
          <Route path="riders/:id" element={<RiderDetail />} />
          <Route path="locations" element={<Locations />} />
          <Route path="analytics" element={<Analytics />} />
        </Routes>
      </Sidebar>
    </>
  );
};

const AdminRoutes = () => {
  const [curDate, setCurDate] = useState(new Date());
  const defaultVal = { curDate, setCurDate };

  return (
    <DateContext.Provider value={defaultVal}>
      <EmployeesProvider>
        <RidersProvider>
          <RidesProvider>
            <LocationsProvider>
              <RoutesComponent />
            </LocationsProvider>
          </RidesProvider>
        </RidersProvider>
      </EmployeesProvider>
    </DateContext.Provider>
  );
};

export default AdminRoutes;
