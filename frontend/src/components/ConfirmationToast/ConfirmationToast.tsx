import React from 'react';
import { check, block } from '../../icons/other/index';
import { ToastStatus } from '../../context/toastContext';

type toastProps = {
  message: string;
  toastType?: ToastStatus;
};

const Toast = ({ message, toastType }: toastProps) => {
  const isSuccess = typeof toastType === 'undefined' || toastType === ToastStatus.SUCCESS;
  return (
    <div className={`fixed top-8 left-1/2 -translate-x-1/2 m-auto p-3 px-4 rounded-lg z-999 flex items-center shadow-lg ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}>
      <img alt={isSuccess ? 'toast check' : 'toast block'} src={isSuccess ? check : block} />
      <p className={`text-lg h-full ml-2.5 text-white`}>{message}</p>
    </div>
  );
};

export default Toast;
