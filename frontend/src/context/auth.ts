import { createContext } from 'react';
import { Admin, Rider, DriverType as Driver } from '../types/index';

export type ValidUser = Admin | Rider | Driver;

type AuthState = {
  logout: () => void;
  id: any;
  user?: ValidUser;
  refreshUser: () => void;
};

const AuthContext = createContext({
  logout: () => {},
  id: '',
  user: {},
  refreshUser: () => {},
} as AuthState);

export default AuthContext;