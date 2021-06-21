import { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';

const useSkipMain = () => {
  const history = useHistory();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const unlisten = history.listen(() => {
      if (ref) {
        ref.current?.focus();
      }
    });
    return unlisten;
  }, [history]);
  return ref;
};

export default useSkipMain;
