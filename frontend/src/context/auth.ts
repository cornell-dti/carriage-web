import { createContext } from 'react';
import { Rider } from '../types/index';
import { AdminType } from '@carriage-web/shared/src/types/admin';
import { DriverType } from '@carriage-web/shared/src/types/driver';

export type ValidUser = AdminType | Rider | DriverType;

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
