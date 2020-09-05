import React, { useState, FunctionComponent, createContext } from 'react';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { useHistory } from "react-router-dom";
import { useClientId } from '../hooks';
import AuthContext from '../context/auth';
import LandingPage from './LandingPage';

export const AuthManager: FunctionComponent = ({ children }) => {
  const [signedIn, setSignedIn] = useState(false);
  const clientId = useClientId();
  let history = useHistory();

  function logout() {
    localStorage.clear();
    setSignedIn(false);
    history.push('/');
  }

  async function onSignIn(googleUser: any) {
    let token = googleUser.getAuthResponse().id_token;
    let email = googleUser.profileObj.email;

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body:
        JSON.stringify({
          "token": token,
          "email": email,
          "table": "Dispatchers",
          "clientId": clientId
        })
    };

    const authorized = await fetch('/auth', requestOptions).then(res => {
      return res.json();
    }).then(data => data['id']);

    if (authorized) {
      setSignedIn(true);
      history.push('/dashboard/home');
    } else {
      logout();
    }
  }

  return (
    signedIn ?
      (
        <AuthContext.Provider value={{ logout }}>
          {children}
        </AuthContext.Provider>
      )
      : (
        <>
          <GoogleLogin
            onSuccess={onSignIn}
            onFailure={() => console.error("failed to sign in")}
            clientId={clientId}
            cookiePolicy={'single_host_origin'}
            isSignedIn
          />
          <LandingPage />
        </>
      )
  )

}

export default AuthManager;