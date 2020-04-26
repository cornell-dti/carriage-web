import React, { useState } from 'react';
import Header from './header';
import Footer from './footer';
import ReadMore from './readmore';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { useHistory } from "react-router-dom";
import '../styles/header.css';

const clientId: string = process.env.REACT_APP_CLIENT_ID!;
export const SignInButton = () => {
  const [showSignIn, toggleShow] = useState(true);
  let history = useHistory();

  function logout() {
    localStorage.clear();
    toggleShow(true);
  }

  async function onSignIn(googleUser: any) {
    let token = googleUser.getAuthResponse().id_token;
    let email = googleUser.profileObj.email;
    toggleShow(false);
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: JSON.stringify({
        "token": token,
        "email": email,
        "table": "Dispatchers",
        "clientID": clientId
      })
    };
    const response = await fetch('/auth', requestOptions);
    const authorized = (await response.json()).success;
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
    <SignInButton />
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
