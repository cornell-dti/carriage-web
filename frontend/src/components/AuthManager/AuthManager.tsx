import React, { useState, useEffect } from 'react';
import {
  useGoogleLogin as googleAuth,
  googleLogout,
} from '@react-oauth/google';
import { useNavigate, Navigate, Route, Routes, useSearchParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AuthContext from '../../context/auth';

import LandingPage from '../../pages/Landing/Landing';
import styles from './authmanager.module.css';
import { studentLanding, car, admin } from '../../icons/other';
import SubscribeWrapper from './SubscrbeWrapper';
import Toast from '../ConfirmationToast/ConfirmationToast';

import AdminRoutes from '../../pages/Admin/Routes';
import RiderRoutes from '../../pages/Rider/Routes';
import DriverRoutes from '../../pages/Driver/Routes';
import { Admin, Rider, DriverType as Driver } from '../../types/index';
import { ToastStatus, useToast } from '../../context/toastContext';
import { createPortal } from 'react-dom';
import CryptoJS from 'crypto-js';
import axios, { setAuthToken } from '../../util/axios';

const secretKey = `${process.env.REACT_APP_ENCRYPTION_KEY!}`;

const encrypt = (data: string) => {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    secretKey
  ).toString();
  return encrypted;
};

export const decrypt = (hash: string | CryptoJS.lib.CipherParams) => {
  const bytes = CryptoJS.AES.decrypt(hash, secretKey);
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
};

const AuthManager = () => {
  const [signedIn, setSignedIn] = useState(getCookie('jwt'));
  const [id, setId] = useState(localStorage.getItem('userId') || '');
  const [user, setUser] = useState<Rider | Admin | Driver>(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const [refreshUser, setRefreshUser] = useState(() =>
    createRefresh(id, localStorage.getItem('userType') || '', jwtValue())
  );
  const [ssoError, setSsoError] = useState<string>('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = jwtValue();
    if (token) {
      setAuthToken(token);
    }
  }, []);

  // SSO Callback handler - fetches profile and JWT after successful SSO login
  const handleSSOCallback = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/sso/profile`, {
        credentials: 'include', // CRITICAL: Sends session cookie
      });

      if (!response.ok) {
        throw new Error('Failed to fetch SSO profile');
      }

      const data = await response.json();
      const { user: ssoUser, token: serverJWT, authMethod } = data;

      if (serverJWT && ssoUser) {
        // Store JWT in encrypted cookie (matching Google OAuth pattern)
        setCookie('jwt', serverJWT);

        // Decode JWT to get user info
        const decoded: any = jwtDecode(serverJWT);

        // Set auth state
        setId(decoded.id);
        localStorage.setItem('userId', decoded.id);
        localStorage.setItem('userType', decoded.userType);
        localStorage.setItem('authMethod', authMethod || 'sso');
        setAuthToken(serverJWT);

        // Refresh user data
        const refreshFunc = createRefresh(decoded.id, decoded.userType, serverJWT);
        refreshFunc();
        setRefreshUser(() => refreshFunc);
        setSignedIn(true);

        // Navigate to appropriate dashboard
        navigate(decoded.userType === 'Admin' ? '/admin/home' : '/rider/home', {
          replace: true,
        });
      } else {
        setSsoError('Failed to complete SSO login. Please try again.');
        logout();
      }
    } catch (error) {
      console.error('SSO callback error:', error);
      setSsoError('Failed to complete login. Please try again.');
      logout();
    }
  };

  // SSO callback handler
  useEffect(() => {
    const authParam = searchParams.get('auth');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      // Handle SSO errors
      const errorMessages: { [key: string]: string } = {
        'user_not_found': 'Your Cornell account is not registered. Please contact support.',
        'User not active': 'Your account is inactive. Please contact support.',
        'sso_failed': 'SSO authentication failed. Please try again.',
      };
      setSsoError(errorMessages[errorParam] || 'Authentication failed. Please try again.');
      navigate('/', { replace: true });
      return;
    }

    if (authParam === 'sso_success') {
      // Fetch profile and JWT token from backend
      handleSSOCallback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function getCookie(name: string) {
    return document.cookie.split(';').some((c) => {
      return c.trim().startsWith(name + '=');
    });
  }

  function jwtValue() {
    try {
      const jwtCookie = document.cookie
        .split(';')
        .find((c) => c.trim().startsWith('jwt='));
      if (jwtCookie) {
        const encryptedJwt = jwtCookie.split('=')[1];
        const decryptedJwt = decrypt(encryptedJwt);
        return decryptedJwt;
      }
    } catch (error) {
      console.error('Error decrypting JWT:', error);
    }
    return '';
  }

  function deleteCookie(name: string) {
    if (getCookie(name)) {
      document.cookie =
        name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;';
    }
  }

  function setCookie(cookieName: string, value: string) {
    document.cookie = `${cookieName}=${encrypt(value)};secure=true;path=/;`;
  }

  function signIn(userType: 'Admin' | 'Rider' | 'Driver', code: string) {
    const table = `${userType}s`;
    const localUserType = localStorage.getItem('userType');
    if (!localUserType || localUserType === userType) {
      axios
        .post('/api/auth', { code, table })
        .then((res) => res.data.jwt)
        .then((serverJWT) => {
          if (serverJWT) {
            setCookie('jwt', serverJWT);
            const decoded: any = jwtDecode(serverJWT);
            setId(decoded.id);
            localStorage.setItem('userId', decoded.id);
            localStorage.setItem('userType', decoded.userType);
            localStorage.setItem('authMethod', 'google');
            setAuthToken(serverJWT);
            console.log('Auth Token : ', serverJWT);
            const refreshFunc = createRefresh(decoded.id, userType, serverJWT);
            refreshFunc();
            setRefreshUser(() => refreshFunc);
            setSignedIn(true);

            // Navigate based on user type
            if (userType === 'Admin') {
              navigate('/admin/home', { replace: true });
            } else if (userType === 'Driver') {
              navigate('/driver/rides', { replace: true });
            } else {
              navigate('/rider/schedule', { replace: true });
            }
          } else {
            logout();
          }
        })
        .catch((error) => {
          console.error('Login error:', error);
          logout();
        });
    }
  }

  const adminLogin = googleAuth({
    flow: 'auth-code',
    onSuccess: async (res) => signIn('Admin', res.code),
    onError: (errorResponse) => console.error(errorResponse),
  });

  const studentLogin = googleAuth({
    flow: 'auth-code',
    onSuccess: async (res) => signIn('Rider', res.code),
    onError: (errorResponse) => console.error(errorResponse),
  });

  const driverLogin = googleAuth({
    flow: 'auth-code',
    onSuccess: async (res) => signIn('Driver', res.code),
    onError: (errorResponse) => console.error(errorResponse),
  });

  // SSO Login handlers
  function handleSSOLogin(isAdmin: boolean = false, isDriver: boolean = false) {
    const frontendUrl = window.location.origin;
    const redirectUri = encodeURIComponent(`${frontendUrl}/`);

    // Determine user type based on button clicked (matching Google OAuth pattern)
    let userType = 'Rider';
    if (isAdmin) {
      userType = 'Admin';
    } else if (isDriver) {
      userType = 'Driver';
    }

    const ssoUrl = `${process.env.REACT_APP_SERVER_URL}/api/sso/login?redirect_uri=${redirectUri}&userType=${userType}`;
    window.location.href = ssoUrl;
  }

  function logout() {
    const authMethod = localStorage.getItem('authMethod');

    // If SSO login, redirect to backend logout to destroy session
    if (authMethod === 'sso') {
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      localStorage.removeItem('user');
      localStorage.removeItem('authMethod');
      deleteCookie('jwt');
      setAuthToken('');
      setSignedIn(false);
      // Redirect to backend SSO logout endpoint
      window.location.href = `${process.env.REACT_APP_SERVER_URL}/api/sso/logout`;
    } else {
      // Google OAuth logout
      googleLogout();
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      localStorage.removeItem('user');
      localStorage.removeItem('authMethod');
      deleteCookie('jwt');
      setAuthToken('');
      setSignedIn(false);
      navigate('/', { replace: true });
    }
  }

  function createRefresh(userId: string, userType: string, token: string) {
    let endpoint = '';

    if (userType === 'Admin') {
      endpoint = `/api/admins/${userId}`;
    } else if (userType === 'Driver') {
      endpoint = `/api/drivers/${userId}`;
    } else {
      endpoint = `/api/riders/${userId}`;
    }

    return () => {
      axios
        .get(endpoint)
        .then((res) => res.data)
        .then(({ data }) => {
          localStorage.setItem('user', JSON.stringify(data));
          setUser(data);
        });
    };
  }

  const { visible, message, toastType } = useToast();

  if (!signedIn) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              ssoError={ssoError}
              students={
                <>
                  <button onClick={() => studentLogin()} className={styles.btn}>
                    <img
                      src={studentLanding}
                      className={styles.icon}
                      alt="student logo"
                    />
                    <div className={styles.heading}>Students</div>
                    Sign in with Google
                  </button>
                  <button
                    onClick={() => handleSSOLogin(false, false)}
                    className={styles.btn}
                    style={{
                      backgroundColor: '#B31B1B',
                      color: 'white',
                      marginTop: '10px'
                    }}
                  >
                    <img
                      src={studentLanding}
                      className={styles.icon}
                      alt="student logo"
                    />
                    <div className={styles.heading}>Students</div>
                    Sign in with Cornell NetID
                  </button>
                </>
              }
              admins={
                <>
                  <button onClick={() => adminLogin()} className={styles.btn}>
                    <img src={admin} className={styles.icon} alt="admin logo" />
                    <div className={styles.heading}>Admins</div>
                    Sign in with Google
                  </button>
                  <button
                    onClick={() => handleSSOLogin(true, false)}
                    className={styles.btn}
                    style={{
                      backgroundColor: '#B31B1B',
                      color: 'white',
                      marginTop: '10px'
                    }}
                  >
                    <img src={admin} className={styles.icon} alt="admin logo" />
                    <div className={styles.heading}>Admins</div>
                    Sign in with Cornell NetID
                  </button>
                </>
              }
              drivers={
                <>
                  <button onClick={() => driverLogin()} className={styles.btn}>
                    <img src={car} className={styles.icon} alt="car logo" />
                    <div className={styles.heading}>Drivers</div>
                    Sign in with Google
                  </button>
                  <button
                    onClick={() => handleSSOLogin(false, true)}
                    className={styles.btn}
                    style={{
                      backgroundColor: '#B31B1B',
                      color: 'white',
                      marginTop: '10px'
                    }}
                  >
                    <img src={car} className={styles.icon} alt="car logo" />
                    <div className={styles.heading}>Drivers</div>
                    Sign in with Cornell NetID
                  </button>
                </>
              }
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <>
      {visible &&
        createPortal(
          <Toast
            message={message}
            toastType={toastType ? ToastStatus.SUCCESS : ToastStatus.ERROR}
          />,
          document.body
        )}
      <AuthContext.Provider value={{ logout, id, user, refreshUser }}>
        <SubscribeWrapper userId={id}>
          <Routes>
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/rider/*" element={<RiderRoutes />} />
            <Route path="/driver/*" element={<DriverRoutes />} />
            <Route
              path="/"
              element={
                <Navigate
                  to={
                    localStorage.getItem('userType') === 'Admin'
                      ? '/admin/home'
                      : localStorage.getItem('userType') === 'Driver'
                      ? '/driver/rides'
                      : '/rider/schedule'
                  }
                  replace
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SubscribeWrapper>
      </AuthContext.Provider>
    </>
  );
};

export default AuthManager;
