import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthManager from './AuthManager';
import useClientId from '../../hooks/useClientId';

export const GoogleAuth = () => {
  const clientId = useClientId();
  return (
    <GoogleOAuthProvider
      clientId={clientId}
      onScriptLoadError={() => console.log('error')}
    >
      <AuthManager />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
