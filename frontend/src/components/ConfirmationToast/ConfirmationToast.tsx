import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { check } from '../../icons/other/index';
import styles from './confirmationtoast.module.css';

type toastProps = {
  message: string;
}

const Toast = ({ message }: toastProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {visible && createPortal(
        <div className={styles.toast}>
          <img alt="toast check icon" src={check} />
          <p className={styles.toasttext}>{message}</p>
        </div>,
        document.body,
      )}
    </>
  );
};

export default Toast;
