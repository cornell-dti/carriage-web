import React, { useContext, FunctionComponent } from 'react';
import { GoogleLogout } from 'react-google-login';
import useClientId from '../../hooks/useClientId';
import AuthContext from '../../context/auth';

const Logout: FunctionComponent = () => {
  const clientId = useClientId();
  const { logout } = useContext(AuthContext);

  return <GoogleLogout onLogoutSuccess={logout} clientId={clientId} />;
};

export default Logout;
