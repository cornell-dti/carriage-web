import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const useSkipMain = () => {
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, [location]);

  return ref;
};

export default useSkipMain;
