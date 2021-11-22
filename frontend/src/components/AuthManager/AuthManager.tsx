import React, { useState, useEffect } from 'react';
import { GoogleLogin, useGoogleLogout } from 'react-google-login';
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

import AdminRoutes from '../../pages/Admin/Routes';
import RiderRoutes from '../../pages/Rider/Routes';
import PrivateRoute from '../PrivateRoute';
import { Admin, Rider } from '../../types/index';
import { useToast } from '../../context/toastContext';

import { check } from '../../icons/other/index';
import { createPortal } from 'react-dom';

export const AuthManager = () => {
  const [signedIn, setSignedIn] = useState(false);
  const [jwt, setJWT] = useState('');
  const [id, setId] = useState('');
  const [initPath, setInitPath] = useState('');
  const [user, setUser] = useState<Admin | Rider>();
  // useState can take a function that returns the new state value, so need to
  // supply a function that returns another function
  const [refreshUser, setRefreshUser] = useState(() => () => {});
  const clientId = useClientId();
  const history = useHistory();
  const { pathname } = useLocation();
  const { signOut } = useGoogleLogout({ clientId });

  useEffect(() => {
    setInitPath(pathname);
  }, [pathname]);

  function logout() {
    signOut();
    localStorage.removeItem('userType');
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
        .then((data) => setUser(data));
    };
  }

  function generateOnSignIn(isAdmin: boolean) {
    const userType = isAdmin ? 'Admin' : 'Rider';
    const table = `${userType}s`;
    const localUserType = localStorage.getItem('userType');
    return async function onSignIn(googleUser: any) {
      if (!localUserType || localUserType === userType) {
        const { id_token: token } = googleUser.getAuthResponse();
        const serverJWT = await fetch(
          '/api/auth',
          withDefaults({
            method: 'POST',
            body: JSON.stringify({
              token,
              table,
              clientId,
            }),
          })
        )
          .then((res) => res.json())
          .then((json) => json.jwt);

        if (serverJWT) {
          const decoded: any = jwtDecode(serverJWT);
          setId(decoded.id);
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
      }
    };
  }

  const LoginPage = () => (
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
          clientId={clientId}
          cookiePolicy="single_host_origin"
          isSignedIn
        />
      }
    />
  );

  const SiteContent = () => {
    const { visible, message } = useToast();

    return (
      <>
        {visible &&
          createPortal(
            <div>
              <img alt="toast check" src={check} />
              <p>{message}</p>
            </div>,
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
