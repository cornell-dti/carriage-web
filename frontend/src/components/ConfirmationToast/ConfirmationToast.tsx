import React from 'react';
import { check, block } from '../../icons/other/index';
import styles from './confirmationtoast.module.css';

type toastProps = {
  message: string;
  toastType?: string;
};

const Toast = ({ message, toastType }: toastProps) => {
  return typeof toastType === 'undefined' || toastType == 'Success' ? (
    <div className={`${styles.toast} ${styles.successToast}`}>
      <img alt="toast blocked" src={check} />
      <p className={styles.toasttext}>{message}</p>
    </div>
  ) : (
    <div className={`${styles.toast} ${styles.errorToast}`}>
      <img alt="toast check" src={block} />
      <p className={styles.toasttext}>{message}</p>
    </div>
  );
};

export default Toast;
