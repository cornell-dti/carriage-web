import React, { useState, useEffect } from 'react';
import { check } from '../../icons/other/index';
import styles from './confirmationtoast.module.css';

type toastProps = {
  message: string;
}

function showToast(text: string) {
  return (<Toast message={text} />);
}

const Toast = ({ message }: toastProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {visible && (
        <div className={styles.toast}>
          <img alt="toast" src={check} />
          <div className={styles.toasttext}>
            {message}
          </div>
        </div>)}
    </>
  );
};

export default showToast;
