import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface PrivateRouteProps {
  forRider?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ forRider = false }) => {
  const location = useLocation();
  const redirectPath = forRider ? '/driver' : '/rider';

  const localUserType = localStorage.getItem('userType');

  if (!localUserType) {
    return <Navigate to="/" replace />;
  }

  if (forRider === (localUserType === 'Rider')) {
    return <Outlet />;
  }

  return <Navigate to={redirectPath} state={{ from: location }} replace />;
};

export default PrivateRoute;