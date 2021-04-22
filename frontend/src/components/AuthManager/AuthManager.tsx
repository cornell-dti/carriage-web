import React, { useState, FunctionComponent } from 'react';
import { GoogleLogin } from 'react-google-login';
import { useHistory, useLocation } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import ReqContext from '../../context/req';
import useClientId from '../../hooks/useClientId';
import AuthContext from '../../context/auth';
import LandingPage from '../../pages/Landing/Landing';
import styles from './authmanager.module.css';

const icon = <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg">
  <g fill="#000" fillRule="evenodd">
    <path
      d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z"
      fill="#EA4335"
    />
    <path d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4" />
    <path
      d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z"
      fill="#FBBC05"
    />
    <path
      d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z"
      fill="#34A853"
    />
    <path fill="none" d="M0 0h18v18H0z" />
  </g>
</svg>;


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
    const serverJWT = await fetch('/api/auth', withDefaults({
      method: 'POST',
      body:
        JSON.stringify({
          token,
          table: 'Admins',
          clientId,
        }),
    }))
      .then((res) => res.json())
      .then((json) => json.jwt);

    if (serverJWT) {
      const decoded: any = jwtDecode(serverJWT);
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
      <LandingPage loginButton={
        <GoogleLogin
          render={
            (renderProps) => (
              <button
                onClick={renderProps.onClick}
                className={styles.btn}
                disabled={renderProps.disabled}>
                <div className={styles.icon}>
                  {icon}
                </div>
                Sign in with Google
              </button>
            )
          }
          onSuccess={onSignIn}
          onFailure={(err) => console.error(err)}
          clientId={clientId}
          cookiePolicy='single_host_origin'
          isSignedIn
        />} />
    </>
  );

  return signedIn ? <SiteContent /> : <AuthBarrier />;
};

export default AuthManager;
