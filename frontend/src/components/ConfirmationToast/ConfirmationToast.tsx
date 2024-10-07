import React, { useState, useEffect } from 'react';
import { green_check, block, close } from '../../icons/other';
import styles from './confirmationtoast.module.css';
import { ToastStatus } from '../../context/toastContext';
import FocusTrap from 'focus-trap-react';
import { createPortal } from 'react-dom';

type toastProps = {
  message: string;
  toastType?: ToastStatus;
  onClose: () => void;
  isOpen: boolean;
};

const Toast = ({ message, toastType, onClose, isOpen }: toastProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'initial';
    }
  }, [isOpen]);
  return toastType == ToastStatus.SUCCESS ? (
    <>
      {isOpen &&
        createPortal(
          <FocusTrap
            focusTrapOptions={{
              onDeactivate: onClose,
              returnFocusOnDeactivate: true,
            }}
          >
            <div className={styles.background}>
              <div
                className={`${styles.toast} ${styles.successToast}`}
                id="bruh"
              >
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
            </div>
          </FocusTrap>,
          document.body
        )}
    </>
  ) : (
    <>
      {isOpen &&
        createPortal(
          <FocusTrap
            focusTrapOptions={{
              onDeactivate: onClose,
              returnFocusOnDeactivate: true,
            }}
          >
            <div className={`${styles.toast} ${styles.errorToast}`}>
              <button onClick={onClose} className={styles.closeButton}>
                <img src={close} className={styles.closeImg}></img>
              </button>
              <div className={styles.toastContent}>
                <img alt="toast check" src={green_check} />
                <p className={styles.toasttext}>{message}</p>
              </div>
              <button onClick={onClose} className={styles.continueButton}>
                <p className={styles.continueText}>Continue</p>
              </button>
            </div>
          </FocusTrap>,
          document.body
        )}
    </>
  );
};

export default Toast;
