import React, { useState, FunctionComponent } from 'react';
import { GoogleLogin } from 'react-google-login';
import { useHistory, useLocation } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import ReqContext from '../../context/req';
import useClientId from '../../hooks/useClientId';
import AuthContext from '../../context/auth';
import LandingPage from '../../pages/Landing/Landing';
import styles from './authmanager.module.css';
import { googleLogin } from '../../icons/other';

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

  function generateOnSignIn(isAdmin: boolean) {
    return async function onSignIn(googleUser: any) {
      const { id_token: token } = googleUser.getAuthResponse();
      const serverJWT = await fetch(
        '/api/auth',
        withDefaults({
          method: 'POST',
          body: JSON.stringify({
            token,
            table: isAdmin ? 'Admins' : 'Riders',
            clientId,
          }),
        }),
      )
        .then((res) => res.json())
        .then((json) => json.jwt);

      if (serverJWT) {
        const decoded: any = jwtDecode(serverJWT);
        setId(decoded.id);
        setJWT(serverJWT);
        setSignedIn(true);
        if (pathname === '/') {
          history.push(isAdmin ? '/admin/home' : '/rider/home');
        }
      } else {
        logout();
      }
    };
  }

  const SiteContent = () => (
    <AuthContext.Provider value={{ logout, id }}>
      <ReqContext.Provider value={{ withDefaults }}>
        {children}
      </ReqContext.Provider>
    </AuthContext.Provider>
  );

  const AuthBarrier = () => (
    <LandingPage
      students={
        <GoogleLogin
          render={(renderProps) => (
            <button
              onClick={renderProps.onClick}
              className={styles.btn}
              disabled={renderProps.disabled}
            >
              <img
                src={googleLogin}
                className={styles.icon}
                alt="google logo"
              />
              <div className={styles.heading}>Students</div>
              Sign in with Google
            </button>
          )}
          onSuccess={generateOnSignIn(false)}
          onFailure={console.error}
          clientId={clientId}
          cookiePolicy="single_host_origin"
          isSignedIn
        />
      }
      admins={
        <GoogleLogin
          render={(renderProps) => (
            <button
              onClick={renderProps.onClick}
              className={styles.btn}
              disabled={renderProps.disabled}
            >
              <img
                src={googleLogin}
                className={styles.icon}
                alt="google logo"
              />
              <div className={styles.heading}>Admins</div>
              Sign in with Google
            </button>
          )}
          onSuccess={generateOnSignIn(true)}
          onFailure={console.error}
          clientId={clientId}
          cookiePolicy="single_host_origin"
          isSignedIn
        />
      }
    />
  );

  return signedIn ? <SiteContent /> : <AuthBarrier />;
};

export default AuthManager;
