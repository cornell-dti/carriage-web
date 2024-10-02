import React, { useState, useEffect } from 'react';
import {
  useGoogleLogin as googleAuth,
  googleLogout,
} from '@react-oauth/google';
import { useNavigate, Navigate, Route, Routes } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AuthContext from '../../context/auth';

import LandingPage from '../../pages/Landing/Landing';
import styles from './authmanager.module.css';
import { googleLogin } from '../../icons/other';
import SubscribeWrapper from './SubscrbeWrapper';
import Toast from '../ConfirmationToast/ConfirmationToast';

import AdminRoutes from '../../pages/Admin/Routes';
import RiderRoutes from '../../pages/Rider/Routes';
import { Admin, Rider } from '../../types/index';
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
  const [user, setUser] = useState<Rider | Admin>(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const [refreshUser, setRefreshUser] = useState(() =>
    createRefresh(id, localStorage.getItem('userType') || '', jwtValue())
  );

  const navigate = useNavigate();

  useEffect(() => {
    const token = jwtValue();
    if (token) {
      setAuthToken(token);
    }
  }, []);

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
          logout();
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
    googleLogout();
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    deleteCookie('jwt');
    setAuthToken('');
    setSignedIn(false);
    navigate('/', { replace: true });
  }

  function createRefresh(userId: string, userType: string, token: string) {
    const endpoint =
      userType === 'Admin' ? `/api/admins/${userId}` : `/api/riders/${userId}`;
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

  const { visible, message, toastType, setVisible } = useToast();

  if (!signedIn) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              students={
                <button onClick={() => studentLogin()} className={styles.btn}>
                  <img
                    src={googleLogin}
                    className={styles.icon}
                    alt="google logo"
                  />
                  <div className={styles.heading}>Students</div>
                  Sign in with Google
                </button>
              }
              admins={
                <button onClick={() => adminLogin()} className={styles.btn}>
                  <img
                    src={googleLogin}
                    className={styles.icon}
                    alt="google logo"
                  />
                  <div className={styles.heading}>Admins</div>
                  Sign in with Google
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
            onClose={() => setVisible(false)}
            isOpen={visible}
          />,
          document.body
        )}
      <AuthContext.Provider value={{ logout, id, user, refreshUser }}>
        <SubscribeWrapper userId={id}>
          <Routes>
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/rider/*" element={<RiderRoutes />} />
            <Route
              path="/"
              element={
                <Navigate
                  to={
                    localStorage.getItem('userType') === 'Admin'
                      ? '/admin/home'
                      : '/rider/home'
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
