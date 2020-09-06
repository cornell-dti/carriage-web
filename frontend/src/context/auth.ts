import { createContext } from "react";

const AuthContext = createContext({ logout: () => { } });

export default AuthContext;