import React, { useState, useRef } from 'react';
import { check } from '../icons/other/index';
import { createPortal } from 'react-dom';

export enum ToastStatus {
  SUCCESS = 'Success',
  ERROR = 'Error',
}

type toastStat = {
  visible: boolean;
  message: string;
  showToast: (message: string, currentToastType: ToastStatus) => void;
  toastType: ToastStatus;
  hideToast: () => void;
};

const initalState: toastStat = {
  visible: false,
  message: '',
  showToast: function () {},
  toastType: ToastStatus.ERROR,
  hideToast: function () {},
};

const ToastContext = React.createContext(initalState);
export const useToast = () => React.useContext(ToastContext);

type ToastProviderProps = {
  children: React.ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [message, setMessage] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  const [toastType, setToastType] = useState<ToastStatus>(ToastStatus.ERROR);
  const showToast = (inputMessage: string, currentToastType: ToastStatus) => {
    setMessage(inputMessage);
    setVisible(true);
    setToastType(currentToastType);
  };

  const hideToast = () => {
    setVisible(false);
  };

  return (
    <ToastContext.Provider
      value={{
        visible,
        message,
        showToast,
        toastType,
        hideToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};
