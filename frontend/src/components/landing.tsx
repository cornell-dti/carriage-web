import React, { useState } from 'react';
import Header from './header';
import Footer from './footer';
import ReadMore from './readmore';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { useHistory } from "react-router-dom";
import '../styles/header.css';
import { response } from 'express';

const clientId: string = process.env.REACT_APP_CLIENT_ID!;
export const SignInButton = () => {
  const [showSignIn, toggleShow] = useState(true);
  let history = useHistory();

  async function logout() {
    localStorage.clear();
    fetch('/auth/delcook').then(
      res => console.log(res)
    );
    history.push('/');
    toggleShow(true);
  }

  async function onSignIn(googleUser: any) {
    var token = googleUser.getAuthResponse().id_token;
    toggleShow(false);
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "token": token,
        "clientID": clientId,
        "email": "cph64@cornell.edu",
        "table": "Dispatchers"
      })
    };
    const response = await fetch('/auth', requestOptions);
    const authorized = (await response.json())['id'];
    if (authorized) {
      history.push('/table')
    } else {
      logout();
    }
  }

  if (showSignIn) {
    return (
      <GoogleLogin
        onSuccess={onSignIn}
        onFailure={() => console.error("failed to sign in")}
        clientId={clientId} isSignedIn={false}
      />
    )
  }
  return (
    <GoogleLogout onLogoutSuccess={logout} clientId={clientId} />
  )
}

const LandingPage = () => (
  <>
    <div>
      <div className="home">
        <Header />
        <ReadMore />
      </div>
      <Footer />
    </div>
  </>
);

export default LandingPage;
