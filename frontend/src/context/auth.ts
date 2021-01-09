import { createContext, useContext } from 'react';

const AuthContext = createContext({ jwt: '', logout: () => { } });

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
