import React from 'react';
import { GoogleLogout } from 'react-google-login';
import { useHistory } from "react-router-dom";

const clientId: string = process.env.REACT_APP_CLIENT_ID!;
const SignInButton = () => {
  let history = useHistory();
  function logout() {
    localStorage.clear();
    history.push('/');
  }
  return (
    <GoogleLogout onLogoutSuccess={logout} clientId={clientId} />
  )
}

export default SignInButton