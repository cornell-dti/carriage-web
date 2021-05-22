import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

interface PrivateRouteProps extends RouteProps {
  forRider?: boolean;
}

const PrivateRoute = ({ forRider = false, component: Component, ...rest }: PrivateRouteProps) => {
  if (!Component) return null;
  const redirectPath = forRider ? '' : '';
  return (
    <Route
      {...rest}
      render={(props) => {
        const localUserType = localStorage.getItem('userType');
        if (localUserType) {
          return (forRider === (localUserType === 'Rider'))
            ? <Component {...props} /> : <Redirect to={{ pathname: redirectPath }} />;
        }
        return <Redirect to={{ pathname: '/' }} />;
      }
      }
    />
  );
};

export default PrivateRoute;
