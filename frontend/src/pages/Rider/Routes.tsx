import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import useSkipMain from '../../hooks/useSkipMain';
import Sidebar from '../../components/Sidebar/Sidebar';
import Schedule from './Schedule';
import Settings from './Settings';
import DateContext from '../../context/date';
import { RidesProvider } from '../../context/RidesContext';

const RoutesComponent = () => {
  const skipRef = useSkipMain();
  return (
    <>
      <div tabIndex={-1} ref={skipRef}></div>
      <HashLink className="skip-main" to="#main">
        Skip to main content
      </HashLink>
      <Sidebar type="rider">
        <Routes>
          <Route index element={<Navigate to="schedule" replace />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="schedule" replace />} />
        </Routes>
      </Sidebar>
    </>
  );
};

const RiderRoutes = () => {
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

export default RiderRoutes;