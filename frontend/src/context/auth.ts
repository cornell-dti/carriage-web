import { createContext } from 'react';

const AuthContext = createContext({ logout: () => { }, id: "" });

export default AuthContext;
