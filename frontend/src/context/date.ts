import { createContext, useContext } from 'react';

type DateContextType = {
  curDate: Date;
  setCurDate: React.Dispatch<React.SetStateAction<Date>>;
};

const DateContext = createContext<DateContextType>(undefined!);

export const useDate = () => useContext(DateContext);

export default DateContext;
