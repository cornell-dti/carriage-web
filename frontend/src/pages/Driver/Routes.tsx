import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import useSkipMain from '../../hooks/useSkipMain';
import Sidebar from '../../components/Sidebar/Sidebar';
import DateContext from '../../context/date';
import { RidesProvider } from '../../context/RidesContext';
import Rides from './Rides';
import Settings from './Settings';

const RoutesComponent = () => {
  const skipRef = useSkipMain();
  return (
    <>
      <div tabIndex={-1} ref={skipRef}></div>
      <HashLink className="skip-main" to="#main">
        Skip to main content
      </HashLink>
      <Sidebar type="driver">
        <Routes>
          <Route index element={<Navigate to="rides" replace />} />
          <Route path="rides" element={<Rides />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="rides" replace />} />
        </Routes>
      </Sidebar>
    </>
  );
};

const DriverRoutes = () => {
  const [curDate, setCurDate] = useState(new Date());
  const defaultVal = { curDate, setCurDate };

  return (
    <DateContext.Provider value={defaultVal}>
      <RidesProvider>
        <RoutesComponent />
      </RidesProvider>
    </DateContext.Provider>
  );
};

export default DriverRoutes;
