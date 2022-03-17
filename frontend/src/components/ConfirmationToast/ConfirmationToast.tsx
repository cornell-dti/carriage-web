import React from 'react';
import { check, block } from '../../icons/other/index';
import styles from './confirmationtoast.module.css';
import { ToastStatus } from '../../context/toastContext';

type toastProps = {
  message: string;
  toastType?: ToastStatus;
};

const Toast = ({ message, toastType }: toastProps) => {
  return typeof toastType === 'undefined' ||
    toastType == ToastStatus.SUCCESS ? (
    <div className={`${styles.toast} ${styles.successToast}`}>
      <img alt="toast check" src={check} />
      <p className={styles.toasttext}>{message}</p>
    </div>
  ) : (
    <div className={`${styles.toast} ${styles.errorToast}`}>
      <img alt="toast block" src={block} />
      <p className={styles.toasttext}>{message}</p>
    </div>
  );
};

export default Toast;
