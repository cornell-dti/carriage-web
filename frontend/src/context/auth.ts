import { createContext } from 'react';
import { Admin, Rider } from '../types/index';
import { DriverType } from '@carriage-web/shared/src/types/driver';

export type ValidUser = Admin | Rider | DriverType;

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
