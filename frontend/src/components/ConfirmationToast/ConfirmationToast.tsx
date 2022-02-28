import React from 'react';
import { check } from '../../icons/other/index';
import styles from './confirmationtoast.module.css';

type toastProps = {
  message: string;
};

const Toast = ({ message }: toastProps) => {
  return (
    <div className={styles.toast}>
      <img alt="toast check" src={check} />
      <p className={styles.toasttext}>{message}</p>
    </div>
  );
};

export default Toast;
