import React, { useState } from 'react';
import { green_check, block, close } from '../../icons/other';
import styles from './confirmationtoast.module.css';
import { ToastStatus } from '../../context/toastContext';

type toastProps = {
  message: string;
  toastType?: ToastStatus;
  onClose: () => void;
};

const Toast = ({ message, toastType, onClose }: toastProps) => {
  return typeof toastType === 'undefined' ||
    toastType == ToastStatus.SUCCESS ? (
    <div className={`${styles.toast} ${styles.successToast}`}>
      <button
        onClick={() => {
          onClose();
        }}
        className={styles.closeButton}
      >
        <img src={close} className={styles.closeImg}></img>
      </button>
      <div className={styles.toastContent}>
        <img alt="toast check" src={green_check} />
        <p className={styles.toasttext}>{message}</p>
      </div>
      <button
        onClick={() => {
          onClose();
        }}
        className={styles.continueButton}
      >
        <p className={styles.continueText}>Continue</p>
      </button>
    </div>
  ) : (
    <div className={`${styles.toast} ${styles.errorToast}`}>
      <img alt="toast block" src={block} />
      <p className={styles.toasttext}>{message}</p>
    </div>
  );
};

export default Toast;
