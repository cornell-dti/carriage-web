import { createContext, useContext } from 'react';

const AuthContext = createContext({ logout: () => { } });

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
