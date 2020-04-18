import React, { useState } from 'react';
import Header from './header';
import Footer from './footer';
import ReadMore from './readmore';
import '../styles/header.css';
import { GoogleLogin, GoogleLogout } from 'react-google-login';

const clientId = "241748771473-0r3v31qcthi2kj09e5qk96mhsm5omrvr.apps.googleusercontent.com";

const error = (response: any) => {
  console.error(response.error)
}

const SignInButton = () => {
  const [showSignIn, toggleShow] = useState(true)

  function onSignIn(googleUser: any) {
    var token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + token);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/auth');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function () {
      console.log(xhr.responseText);
      console.log('Signed in as: ' + xhr.responseText);
    };
    xhr.send('token=' + token);
    console.log(xhr.responseText);

    // when load then will get json file,
    //  if success false -> automatically log them out. 
    //  If true -> go to drivers table

    // toggleShow(false);
  }

  if (showSignIn) {
    return (
      <GoogleLogin onSuccess={onSignIn}
        onFailure={error} clientId={clientId} isSignedIn={true}
      />
    )
  }
  return (
    <GoogleLogout onLogoutSuccess={() => toggleShow(true)} clientId={clientId} />
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
