import { useState, useEffect } from 'react';

// Hook adapted from https://usehooks.com/useWindowSize/

type WindowSize = {
  width?: number;
  height?: number;
}

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<WindowSize>({});

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export default useWindowSize;
