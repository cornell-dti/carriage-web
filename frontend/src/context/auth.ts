import { createContext } from 'react';

const AuthContext = createContext({
  logout: () => {
    // do nothing
  },
});

export default AuthContext;
