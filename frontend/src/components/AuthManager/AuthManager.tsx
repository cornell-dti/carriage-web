import React, { useState, useEffect } from 'react';
import {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
  useGoogleLogin,
} from 'react-google-login';
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
import SubscribeWrapper from './SubscrbeWrapper';

import AdminRoutes from '../../pages/Admin/Routes';
import RiderRoutes from '../../pages/Rider/Routes';
import PrivateRoute from '../PrivateRoute';
import { Admin, Rider } from '../../types/index';

type LoginPageProps = {
  setGoogleResponse: (
    res: GoogleLoginResponse | GoogleLoginResponseOffline
  ) => void;
  setIsAdmin: (isAdmin: boolean) => void;
};

const LoginPage = ({ setGoogleResponse, setIsAdmin }: LoginPageProps) => {
  const clientId = useClientId();
  const { signIn } = useGoogleLogin({
    clientId,
    cookiePolicy: 'single_host_origin',
    isSignedIn: true,
    onSuccess: setGoogleResponse,
  });

  function onClick(admin: boolean) {
    return () => {
      setIsAdmin(admin);
      signIn();
    };
  }

  return (
    <LandingPage
      students={}
      admins={<SignInButton user="Admins" onClick={onClick(true)} />}
    />
  );
};

type SiteContentProps = {
  logout: () => void;
  id: string;
  user?: Admin | Rider;
  refreshUser: () => void;
  withDefaults: (options?: RequestInit) => RequestInit;
};

const SiteContent = ({
  logout,
  id,
  user,
  refreshUser,
  withDefaults,
}: SiteContentProps) => (
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
);

const AuthBarrier = () => (
  <Switch>
    <Route exact path="/" component={<LoginPage />} />
    <Route path="*">
      <Redirect to="/" />
    </Route>
  </Switch>
);

export const AuthManager = () => {
  const [signedIn, setSignedIn] = useState(false);
  const [googleResponse, setGoogleResponse] = useState<
    GoogleLoginResponse | GoogleLoginResponseOffline
  >();
  const [isAdmin, setIsAdmin] = useState<boolean>();
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

  useEffect(() => {
    setInitPath(pathname);
  }, [pathname]);

  useEffect(() => {
    if (googleResponse && isAdmin !== undefined) {
      onSignIn(googleResponse);
    }
  }, [googleResponse, isAdmin]);

  function logout() {
    localStorage.removeItem('userType');
    if (jwt) {
      setJWT('');
    }
    setGoogleResponse(undefined);
    setIsAdmin(undefined);
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

  async function onSignIn(googleUser: any) {
    const userType = isAdmin ? 'Admin' : 'Rider';
    const table = `${userType}s`;
    const localUserType = localStorage.getItem('userType');
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
  }

  return signedIn ? (
    <SiteContent
      logout={logout}
      id={id}
      user={user}
      refreshUser={refreshUser}
      withDefaults={withDefaults}
    />
  ) : (
    <AuthBarrier />
  );
};

export default AuthManager;
