import React, { useState, useRef } from 'react';
import { check } from '../icons/other/index';
import { createPortal } from 'react-dom';

enum ToastStatus {
  SUCCESS = 'Success',
  ERROR = 'Error',
}

type toastStat = {
  visible: boolean;
  message: string;
  showToast: (message: string) => void;
};

const initalState: toastStat = {
  visible: false,
  message: '',
  showToast: function () {},
};

const ToastContext = React.createContext(initalState);
export const useToast = () => React.useContext(ToastContext);

type ToastProviderProps = {
  children: React.ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [message, setMessage] = useState<string>('');
  const [visible, setVisible] = useState(false);

  const showToast = (inputMessage: string) => {
    setMessage(inputMessage);
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
    }, 2000);
  };

  return (
    <ToastContext.Provider
      value={{
        visible,
        message,
        showToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};
