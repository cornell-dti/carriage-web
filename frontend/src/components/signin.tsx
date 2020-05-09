import React, { useState } from 'react';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { useHistory } from "react-router-dom";

const clientId: string = process.env.REACT_APP_CLIENT_ID!;
export const SignInButton = () => {
  const [showSignIn, toggleShow] = useState(true);
  let history = useHistory();

  function logout() {
    localStorage.clear();
    fetch('/auth/logout').then(
      res => console.log(res)
    );
    toggleShow(true);
    history.push('/');
  }

  async function onSignIn(googleUser: any) {
    let token = googleUser.getAuthResponse().id_token;
    let email = googleUser.profileObj.email;
    toggleShow(false);
    console.log('will run again')
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body:
        JSON.stringify({
          "token": token,
          "email": email,
          "table": "Dispatchers",
          "clientID": clientId
        })
    };
    const authorized = await fetch('/auth', requestOptions).then((res) =>
      res.json()
    ).then((data) => data['id']);
    if (authorized) {
      history.push('/rider-table')
    } else {
      logout();
    }
  }
  if (showSignIn) {
    return (
      <GoogleLogin
        onSuccess={onSignIn}
        onFailure={() => console.error("failed to sign in")}
        clientId={clientId} isSignedIn={true}
      />
    )
  }
  return (
    <GoogleLogout onLogoutSuccess={logout} clientId={clientId} />
  )
}

export default SignInButton