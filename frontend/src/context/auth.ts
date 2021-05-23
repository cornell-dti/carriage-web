import { createContext } from 'react';
import { Admin, Rider } from '../types/index';

type AuthState = {
  logout: () => void;
  id: string;
  user?: Admin | Rider,
  refreshUser: () => void;
}

const AuthContext = createContext({
  logout: () => { },
  id: '',
  user: {},
  refreshUser: () => { },
} as AuthState);

export default AuthContext;
