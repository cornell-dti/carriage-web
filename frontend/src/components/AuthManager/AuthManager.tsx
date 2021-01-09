import React, { useState, FunctionComponent } from 'react';
import { GoogleLogin } from 'react-google-login';
import { useHistory, useLocation } from 'react-router-dom';
import useClientId from '../../hooks/useClientId';
import AuthContext from '../../context/auth';
import LandingPage from '../../pages/Landing/Landing';

export const AuthManager: FunctionComponent = ({ children }) => {
  const [signedIn, setSignedIn] = useState(false);
  const [jwt, setJWT] = useState('');
  const clientId = useClientId();
  const history = useHistory();
  const { pathname } = useLocation();

  function logout() {
    localStorage.clear();
    setSignedIn(false);
    setJWT('');
    if (pathname !== '/') {
      history.push('/');
    }
  }

  async function onSignIn(googleUser: any) {
    const { id_token: token } = googleUser.getAuthResponse();
    const { email } = googleUser.profileObj;

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body:
        JSON.stringify({
          token,
          email,
          table: 'Dispatchers',
          clientId,
        }),
    };

    const userJWT = await fetch('/api/auth', requestOptions)
      .then((res) => res.json())
      .then((data) => data.jwt);

    if (userJWT) {
      setJWT(userJWT);
      setSignedIn(true);
      if (pathname === '/') {
        history.push('/dashboard/home');
      }
    } else {
      logout();
    }
  }

  const SiteContent = () => (
    <AuthContext.Provider value={{ jwt, logout }}>
      {children}
    </AuthContext.Provider>
  );

  const AuthBarrier = () => (
    <>
      <GoogleLogin
        onSuccess={onSignIn}
        onFailure={(err) => console.error(err)}
        clientId={clientId}
        cookiePolicy='single_host_origin'
        isSignedIn
      />
      <LandingPage />
    </>
  );

  return signedIn ? <SiteContent /> : <AuthBarrier />;
};

export default AuthManager;
