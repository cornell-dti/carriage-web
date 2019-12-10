import React, { Component } from "react";
import GoogleLogin from "react-google-login";

export default class Google extends Component {
  state = {
    isLoggedIn: false,
    clientID: " ",
    name: ""
  };
  responseGoogle = function response() {
    //console.log(response);
    this.setState({
      isLoggedIn: true,
      clientID: response.clientID,
      name: response.name
    });
  };
  render() {
    let gContent;
    if (this.state.isLoggedIn) {
      gContent = (
        <div
          style={{
            width: "400px",
            margin: "auto",
            background: "lightgray",
            padding: "20px"
          }}
        >
          <h2> Welcome </h2>
        </div>
      );
    } else {
      gContent = (
        <div id="block1">
          <GoogleLogin
            clientId="346199868830-dfi7n737u4g6ajl3ketot11d1m3n1sr3.apps.googleusercontent.com"
            buttonText="Login"
            onSuccess={this.responseGoogle}
            onFailure={this.responseGoogle}
            cookiePolicy={"single_host_origin"}
          />
        </div>
      );
    }
    return <div>{gContent}</div>;
  }
}
