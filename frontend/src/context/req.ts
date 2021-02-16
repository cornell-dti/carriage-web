import { createContext, useContext } from 'react';

const ReqContext = createContext({
  // eslint-disable-next-line no-unused-vars
  withDefaults: (options?: RequestInit) => ({} as RequestInit),
});

export const useReq = () => useContext(ReqContext);

export default ReqContext;
