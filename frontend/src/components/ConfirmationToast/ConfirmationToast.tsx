import React from 'react';
import { check, block } from '../../icons/other/index';
import { ToastStatus } from '../../context/toastContext';

type toastProps = {
  message: string;
  toastType?: ToastStatus;
};

const Toast = ({ message, toastType }: toastProps) => {
  const baseClasses = 'fixed top-[2rem] left-[50%] translate-x-[-50%] mx-auto p-[0.75rem_1rem] shadow-[4px_6px_30px_5px_rgba(0,0,0,0.15)] rounded-[0.625rem] z-[999] flex items-center';
  const isSuccess = typeof toastType === 'undefined' || toastType == ToastStatus.SUCCESS;
  const toastClasses = isSuccess ? `${baseClasses} bg-[#00c48c]` : `${baseClasses} bg-[#ff0000]`;
  const icon = isSuccess ? check : block;

  return (
    <div className={toastClasses}>
      <img alt={isSuccess ? 'toast check' : 'toast block'} src={icon} />
      <p className="text-[1.0625rem] h-full ml-[0.625rem] text-white">{message}</p>
    </div>
  );
};

export default Toast;
