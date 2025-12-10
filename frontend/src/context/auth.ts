import { createContext } from 'react';
import { RiderType } from '@carriage-web/shared/types/rider';
import { AdminType } from '@carriage-web/shared/types/admin';
import { DriverType } from '@carriage-web/shared/types/driver';

export type ValidUser = AdminType | RiderType | DriverType;

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
