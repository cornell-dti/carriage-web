import { createContext, useContext } from 'react';

const ReqContext = createContext({
  withDefaults: (options?: RequestInit) => ({} as RequestInit),
});

export const useReq = () => useContext(ReqContext);

export default ReqContext;
