import React, { useState, FunctionComponent } from 'react';
import { GoogleLogin } from 'react-google-login';
import { useHistory, useLocation } from 'react-router-dom';
import ReqContext from '../../context/req';
import useClientId from '../../hooks/useClientId';
import AuthContext from '../../context/auth';
import LandingPage from '../../pages/Landing/Landing';
import jwtDecode from 'jwt-decode';


export const AuthManager: FunctionComponent = ({ children }) => {
  const [signedIn, setSignedIn] = useState(false);
  const [jwt, setJWT] = useState('');
  const [id, setId] = useState('');
  const clientId = useClientId();
  const history = useHistory();
  const { pathname } = useLocation();

  function logout() {
    localStorage.clear();
    if (jwt) {
      setJWT('');
    }
    setSignedIn(false);
    if (pathname !== '/') {
      history.push('/');
    }
  }

  function withDefaults(options?: RequestInit) {
    return {
      ...options,
      headers: {
        authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    } as RequestInit;
  }

  async function onSignIn(googleUser: any) {
    const { id_token: token } = googleUser.getAuthResponse();
    const { email } = googleUser.profileObj;
    const serverJWT = await fetch('/api/auth', withDefaults({
      method: 'POST',
      body:
        JSON.stringify({
          token,
          email,
          table: 'Admins',
          clientId,
        }),
    }))
      .then((res) => res.json())
      .then((json) => json.jwt);

    if (serverJWT) {
      var decoded: any = jwtDecode(serverJWT);
      setId(decoded.id);
      setJWT(serverJWT);
      setSignedIn(true);
      if (pathname === '/') {
        history.push('/dashboard/home');
      }
    } else {
      logout();
    }
  }

  const SiteContent = () => (
    <AuthContext.Provider value={{ logout, id }}>
      <ReqContext.Provider value={{ withDefaults }}>
        {children}
      </ReqContext.Provider>
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
