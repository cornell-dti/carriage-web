import React, { useState, useEffect } from 'react';
import {
  useNavigate,
  Navigate,
  Route,
  Routes,
  useSearchParams,
} from 'react-router-dom';
  useNavigate,
  Navigate,
  Route,
  Routes,
  useSearchParams,
} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AuthContext from '../../context/auth';

import LandingPage from '../../pages/Landing/Landing';
import styles from './authmanager.module.css';
import { studentLanding, car, admin } from '../../icons/other';
import SubscribeWrapper from './SubscrbeWrapper';
import Toast from '../ConfirmationToast/ConfirmationToast';

import AdminRoutes from '../../pages/Admin/Routes';
import RiderRoutes from '../../pages/Rider/Routes';
import { Admin, Rider, UnregisteredUser } from '../../types/index';
import { ToastStatus, useToast } from '../../context/toastContext';
import { createPortal } from 'react-dom';
import CryptoJS from 'crypto-js';
import axios, { setAuthToken } from '../../util/axios';
import UnregisteredUserPage from '../Onboarding/UnregisteredUserPage';
import UnregisteredUserPage from '../Onboarding/UnregisteredUserPage';

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
  const [unregisteredUser, setUnregisteredUser] =
    useState<UnregisteredUser | null>(null);

  const navigate = useNavigate();

  // Handler to go back from unregistered screen
  const handleBackFromUnregistered = () => {
    setUnregisteredUser(null);
    logout();
  };

  useEffect(() => {
    const token = jwtValue();
    if (token) {
      setAuthToken(token);
    }
  }, []);

  // SSO Callback handler - fetches profile and JWT after successful SSO login
  const handleSSOCallback = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/sso/profile`,
        {
          credentials: 'include', // CRITICAL: Sends session cookie
        }
      );
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/sso/profile`,
        {
          credentials: 'include', // CRITICAL: Sends session cookie
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch SSO profile');
      }

      const data = await response.json();
      const { user: ssoUser, token: serverJWT } = data;
      const { user: ssoUser, token: serverJWT } = data;

      if (serverJWT && ssoUser) {
        // Store JWT in encrypted cookie (matching Google OAuth pattern)
        setCookie('jwt', serverJWT);

        // Decode JWT to get user info
        const decoded: any = jwtDecode(serverJWT);

        // Set auth state
        setId(decoded.id);
        localStorage.setItem('userId', decoded.id);
        localStorage.setItem('userType', decoded.userType);
        setAuthToken(serverJWT);

        // Refresh user data
        const refreshFunc = createRefresh(
          decoded.id,
          decoded.userType,
          serverJWT
        );
        const refreshFunc = createRefresh(
          decoded.id,
          decoded.userType,
          serverJWT
        );
        refreshFunc();
        setRefreshUser(() => refreshFunc);
        setSignedIn(true);

        // Navigate to appropriate dashboard based on userType
        if (decoded.userType === 'Admin') {
          navigate('/admin/home', { replace: true });
        } else if (decoded.userType === 'Driver') {
          navigate('/driver/rides', { replace: true });
        } else if (decoded.userType === 'Rider') {
          navigate('/rider/schedule', { replace: true });
        } else {
          // Invalid userType - this should never happen if backend is working correctly
          setSsoError('Invalid user type received. Please contact support.');
          logout();
        }
        // Navigate to appropriate dashboard based on userType
        if (decoded.userType === 'Admin') {
          navigate('/admin/home', { replace: true });
        } else if (decoded.userType === 'Driver') {
          navigate('/driver/rides', { replace: true });
        } else if (decoded.userType === 'Rider') {
          navigate('/rider/schedule', { replace: true });
        } else {
          // Invalid userType - this should never happen if backend is working correctly
          setSsoError('Invalid user type received. Please contact support.');
          logout();
        }
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
      // Handle user_not_found specially - fetch unregistered user info
      if (errorParam === 'user_not_found') {
        fetch(`${process.env.REACT_APP_SERVER_URL}/api/sso/unregistered-user`, {
          credentials: 'include', // Send session cookie
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.user) {
              setUnregisteredUser(data.user);
              navigate('/', { replace: true });
            } else {
              // Fallback if no user info available
              setSsoError(
                'Your Cornell account is not registered. Please contact support.'
              );
              navigate('/', { replace: true });
            }
          })
          .catch((error) => {
            console.error('Error fetching unregistered user info:', error);
            setSsoError(
              'Your Cornell account is not registered. Please contact support.'
            );
            navigate('/', { replace: true });
          });
        return;
      }

      // Handle other SSO errors
      const errorMessages: { [key: string]: string } = {
        user_not_found:
          'Your Cornell account is not registered. Please contact support.',
        'User not active': 'Your account is inactive. Please contact support.',
        sso_failed: 'SSO authentication failed. Please try again.',
        sso_failed: 'SSO authentication failed. Please try again.',
      };
      setSsoError(
        errorMessages[errorParam] || 'Authentication failed. Please try again.'
      );
      setSsoError(
        errorMessages[errorParam] || 'Authentication failed. Please try again.'
      );
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

  function signIn(isAdmin: boolean, code: string) {
    const userType = isAdmin ? 'Admin' : 'Rider';
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
            setAuthToken(serverJWT);
            console.log('Auth Token : ', serverJWT);
            const refreshFunc = createRefresh(decoded.id, userType, serverJWT);
            refreshFunc();
            setRefreshUser(() => refreshFunc);
            setSignedIn(true);
            navigate(isAdmin ? '/admin/home' : '/rider/home', {
              replace: true,
            });
          } else {
            logout();
          }
        })
        .catch((error) => {
          console.error('Login error:', error);

          if (
            error.response?.status === 400 &&
            error.response?.data?.err === 'User not found'
          ) {
            setUnregisteredUser({
              ...error.response?.data?.user,
            });
          } else {
            logout();
          }
        });
    }
  }

  const adminLogin = googleAuth({
    flow: 'auth-code',
    onSuccess: async (res) => signIn(true, res.code),
    onError: (errorResponse) => console.error(errorResponse),
  });

  const studentLogin = googleAuth({
    flow: 'auth-code',
    onSuccess: async (res) => signIn(false, res.code),
    onError: (errorResponse) => console.error(errorResponse),
  });

  function logout() {
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    deleteCookie('jwt');
    setAuthToken('');
    setSignedIn(false);
    window.location.href = `${process.env.REACT_APP_SERVER_URL}/api/sso/logout`;
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    deleteCookie('jwt');
    setAuthToken('');
    setSignedIn(false);
    window.location.href = `${process.env.REACT_APP_SERVER_URL}/api/sso/logout`;
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

  if (unregisteredUser) {
    return (
      <UnregisteredUserPage
        user={unregisteredUser}
        onBack={handleBackFromUnregistered}
      />
    );
  }

  if (unregisteredUser) {
    return (
      <UnregisteredUserPage
        user={unregisteredUser}
        onBack={handleBackFromUnregistered}
      />
    );
  }

  if (!signedIn) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              ssoError={ssoError}
              students={
                <button
                  onClick={() => handleSSOLogin(false, false)}
                  className={styles.ssoBtn}
                >
                  <img
                    src={studentLanding}
                    className={styles.icon}
                    alt="student logo"
                  />
                  <div className={styles.heading}>Students</div>
                  <div>Sign in with</div>
                  <div>Cornell NetID</div>
                </button>
                <button
                  onClick={() => handleSSOLogin(false, false)}
                  className={styles.ssoBtn}
                >
                  <img
                    src={studentLanding}
                    className={styles.icon}
                    alt="student logo"
                  />
                  <div className={styles.heading}>Students</div>
                  <div>Sign in with</div>
                  <div>Cornell NetID</div>
                </button>
              }
              admins={
                <button
                  onClick={() => handleSSOLogin(true, false)}
                  className={styles.ssoBtn}
                >
                  <img src={admin} className={styles.icon} alt="admin logo" />
                  <div className={styles.heading}>Admins</div>
                  <div>Sign in with</div>
                  <div>Cornell NetID</div>
                </button>
                <button
                  onClick={() => handleSSOLogin(true, false)}
                  className={styles.ssoBtn}
                >
                  <img src={admin} className={styles.icon} alt="admin logo" />
                  <div className={styles.heading}>Admins</div>
                  <div>Sign in with</div>
                  <div>Cornell NetID</div>
                </button>
              }
              drivers={
                <button
                  onClick={() => handleSSOLogin(false, true)}
                  className={styles.ssoBtn}
                >
                  <img src={car} className={styles.icon} alt="car logo" />
                  <div className={styles.heading}>Drivers</div>
                  <div>Sign in with</div>
                  <div>Cornell NetID</div>
                </button>
                <button
                  onClick={() => handleSSOLogin(false, true)}
                  className={styles.ssoBtn}
                >
                  <img src={car} className={styles.icon} alt="car logo" />
                  <div className={styles.heading}>Drivers</div>
                  <div>Sign in with</div>
                  <div>Cornell NetID</div>
                </button>
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
