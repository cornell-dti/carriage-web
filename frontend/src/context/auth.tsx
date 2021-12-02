import React, { createContext, useContext, useState } from 'react';
import { Admin, Rider } from '../types/index';
import useClientId from '../hooks/useClientId';
import jwtDecode from 'jwt-decode';

type AuthState = {
  id: string;
  user?: Admin | Rider;
  refreshUser: () => void;
  onLoginSuccess: (googleUser: any) => void;
  onLogoutSuccess: () => void;
  setIsAdmin: (isAdmin: boolean) => void;
};

const AuthContext = createContext({
  id: '',
  refreshUser: () => {},
  onLoginSuccess: () => {},
  onLogoutSuccess: () => {},
  setIsAdmin: () => {},
} as AuthState);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = () => {
  const [id, setId] = useState('');
  const [user, setUser] = useState<Admin | Rider>();
  const [isAdmin, setIsAdmin] = useState<boolean>();
  const [jwt, setJWT] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const clientId = useClientId();

  function refreshUser() {
    const fetchURL = isAdmin ? `/api/admins/${id}` : `/api/riders/${id}`;
    fetch(fetchURL, {
      headers: {
        authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => setUser(data));
  }

  async function onLoginSuccess(googleUser: any) {
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

  function onLogoutSuccess() {
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

  return (
    <AuthContext.Provider
      value={{
        id,
        user,
        refreshUser,
        onLoginSuccess,
        onLogoutSuccess,
        setIsAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
