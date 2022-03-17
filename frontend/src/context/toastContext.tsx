import React, { useState, useRef } from 'react';
import { check } from '../icons/other/index';
import { createPortal } from 'react-dom';

export enum ToastStatus {
  SUCCESS = 'Success',
  ERROR = 'Error'
}

type toastStat = {
  visible: boolean;
  message: string;
  showToast: (message: string, currentToastType: ToastStatus) => void;
  toastType: boolean;
};

const initalState: toastStat = {
  visible: false,
  message: '',
  showToast: function () {},
  toastType: false
};

const ToastContext = React.createContext(initalState);
export const useToast = () => React.useContext(ToastContext);

type ToastProviderProps = {
  children: React.ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [message, setMessage] = useState<string>('');
  const [visible, setVisible] = useState(false);
  const [toastType, setToastType] = useState(true);
  const showToast = (inputMessage: string, currentToastType: ToastStatus) => {
    setMessage(inputMessage);
    setVisible(true);
    currentToastType == ToastStatus.ERROR
      ? setToastType(false)
      : currentToastType == ToastStatus.SUCCESS
      ? setToastType(true)
      : new Error('Invalid Toast type');
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
        toastType
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};
