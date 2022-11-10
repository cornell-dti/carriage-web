import React, { useState, useEffect } from 'react';
import {
  useGoogleLogin,
  googleLogout,
  TokenResponse,
} from '@react-oauth/google';
import {
  useHistory,
  useLocation,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import ReqContext from '../../context/req';
import useClientId from '../../hooks/useClientId';
import AuthContext from '../../context/auth';

import LandingPage from '../../pages/Landing/Landing';
import styles from './authmanager.module.css';
import { googleLogin } from '../../icons/other';
import SubscribeWrapper from './SubscrbeWrapper';
import Toast from '../ConfirmationToast/ConfirmationToast';

import AdminRoutes from '../../pages/Admin/Routes';
import RiderRoutes from '../../pages/Rider/Routes';
import PrivateRoute from '../PrivateRoute';
import { Admin, Rider } from '../../types/index';
import { ToastStatus, useToast } from '../../context/toastContext';
import axios from 'axios';
import { createPortal } from 'react-dom';

export const AuthManager = () => {
  const [signedIn, setSignedIn] = useState(get_cookie('jwt'));
  const [jwt, setJWT] = useState(jwt_value());
  const [id, setId] = useState(localStorage.getItem('userId')!);
  const [initPath, setInitPath] = useState('');
  console.log(JSON.parse(localStorage.getItem('user')!));
  const [user, setUser] = useState<Admin | Rider>(
    JSON.parse(localStorage.getItem('user')!)
  );
  // useState can take a function that returns the new state value, so need to
  // supply a function that returns another function
  const [refreshUser, setRefreshUser] = useState(() => () => {});
  const history = useHistory();
  const { pathname } = useLocation();

  useEffect(() => {
    setInitPath(pathname);
  }, [pathname]);

  function get_cookie(name: string) {
    return document.cookie.split(';').some((c) => {
      return c.trim().startsWith(name + '=');
    });
  }

  function jwt_value() {
    try {
      const jwt_index = document.cookie.indexOf('jwt=') + 4;
      const jwt_end_string = document.cookie.slice(jwt_index);
      const jwt_end_index = jwt_end_string.indexOf(';');
      return jwt_end_index != -1
        ? document.cookie.slice(jwt_index, jwt_index + jwt_end_index)
        : document.cookie.slice(jwt_index);
    } catch {
      return '';
    }
  }

  function delete_cookie(name: string) {
    if (get_cookie(name)) {
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
  }

  function setCookie(c_name: string, value: string) {
    document.cookie = c_name + '=' + value + ';';
  }

  function googleAuth(isAdmin: boolean) {
    return useGoogleLogin({
      flow: 'implicit',
      onSuccess: async (tokenResponse: TokenResponse) => {
        const userInfo = await axios
          .get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          })
          .then((res) => res.data);

        console.log(userInfo);
        signIn(isAdmin, userInfo);
      },
      onError: (errorResponse: any) => console.log(errorResponse),
    });
  }
  console.log(jwt);
  function signIn(isAdmin: boolean, userInfo: any) {
    const userType = isAdmin ? 'Admin' : 'Rider';
    const table = `${userType}s`;
    const localUserType = localStorage.getItem('userType');
    if (!localUserType || localUserType === userType) {
      (async () => {
        const serverJWT = await fetch(
          '/api/auth',
          withDefaults({
            method: 'POST',
            body: JSON.stringify({
              userInfo,
              table,
            }),
          })
        )
          .then((res) => res.json())
          .then((json) => json.jwt);

        if (serverJWT) {
          setCookie('jwt', serverJWT);
          const decoded: any = jwtDecode(serverJWT);
          setId(decoded.id);
          localStorage.setItem('userId', decoded.id);
          localStorage.setItem('userType', decoded.userType);
          setJWT(serverJWT);
          const refreshFunc = createRefresh(decoded.id, userType, serverJWT);
          refreshFunc();
          setRefreshUser(() => refreshFunc);
          setSignedIn(true);
          if (initPath === '/') {
            history.push(isAdmin ? '/admin/home' : '/rider/home');
          } else {
            history.push(initPath);
          }
        } else {
          logout();
        }
      })();
    }
  }

  const adminLogin = googleAuth(true);
  const studentLogin = googleAuth(false);
  function logout() {
    console.log('called');
    googleLogout();
    console.log('logged  out of google');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    delete_cookie('jwt');
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

  function createRefresh(userId: string, userType: string, token: string) {
    const fetchURL =
      userType === 'Admin' ? `/api/admins/${userId}` : `/api/riders/${userId}`;
    return () => {
      fetch(fetchURL, {
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        });
    };
  }

  const LoginPage = () => (
    <LandingPage
      students={
        <button onClick={() => studentLogin()} className={styles.btn}>
          <img src={googleLogin} className={styles.icon} alt="google logo" />
          <div className={styles.heading}>Students</div>
          Sign in with Google
        </button>
      }
      admins={
        <button onClick={() => adminLogin()} className={styles.btn}>
          <img src={googleLogin} className={styles.icon} alt="google logo" />
          <div className={styles.heading}>Admins</div>
          Sign in with Google
        </button>
      }
    />
  );

  const SiteContent = () => {
    const { visible, message, toastType } = useToast();

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
          <ReqContext.Provider value={{ withDefaults }}>
            <SubscribeWrapper userId={id}>
              <Switch>
                <Route exact path="/" component={LoginPage} />
                <PrivateRoute path="/admin" component={AdminRoutes} />
                <PrivateRoute forRider path="/rider" component={RiderRoutes} />
                <Route path="*">
                  <Redirect to="/" />
                </Route>
              </Switch>
            </SubscribeWrapper>
          </ReqContext.Provider>
        </AuthContext.Provider>
      </>
    );
  };

  const AuthBarrier = () => (
    <Switch>
      <Route exact path="/" component={LoginPage} />
      <Route path="*">
        <Redirect to="/" />
      </Route>
    </Switch>
  );

  return signedIn ? <SiteContent /> : <AuthBarrier />;
};

export default AuthManager;
