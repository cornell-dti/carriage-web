import { createContext } from 'react';
import { AdminType } from '@shared/types/admin';
import { RiderType } from '@shared/types/rider';
import { DriverType } from '@shared/types/driver';

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
