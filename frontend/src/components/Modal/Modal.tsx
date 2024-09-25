import React, { useEffect } from 'react';
import FocusTrap from 'focus-trap-react';
import { createPortal } from 'react-dom';
import styles from './modal.module.css';
import { close } from '../../icons/other/index';

type PageIndicatorsProps = {
  pages: number;
  current: number;
};

const PageIndicators = ({ pages, current }: PageIndicatorsProps) => {
  // setting arrayLength only sets length property of empty array, need to
  // use spread operator to actually get empty array w/ length pages
  const indicators = [...new Array(pages)];
  return (
    <div className={styles.pageIndicators}>
      {indicators.map((_, i) => (
        <span
          key={String(i)}
          className={styles.indicator}
          style={{ background: i === current ? '#000' : '#C4C4C4' }}
        />
      ))}
    </div>
  );
};

type ModalProps = {
  title: string | string[];
  isOpen: boolean;
  paginate?: boolean;
  currentPage?: number;
  children: React.ReactNode;
  onClose?: () => void;
  displayClose?: boolean;
  isRider?: boolean;
  id?: string;
  arialabelledby?: string;
};

const Modal = ({
  title,
  isOpen,
  paginate = false,
  currentPage = 0,
  children,
  onClose,
  displayClose,
  isRider = true,
  arialabelledby,
  id = 'modal',
}: ModalProps) => {
  // Wrapping children in Array to match type for numPages
  const pages = paginate ? (children as React.ReactNodeArray) : [children];
  const numPages = paginate ? title.length : pages.length;
  const currentTitle = paginate ? title[currentPage] : title;
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'initial';
    }
  }, [isOpen]);
  return (
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
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby={arialabelledby ?? id}
              >
                <div className={styles.topContainer}>
                  {isRider ? (
                    <h1 className={styles.title} id={id}>
                      {currentTitle}
                    </h1>
                  ) : (
                    <div className={styles.title} id={id}>
                      {currentTitle}
                    </div>
                  )}
                  {!displayClose && isRider && (
                    <button
                      className={styles.closeBtn}
                      id={'close'}
                      onClick={onClose}
                    >
                      <img alt="close" src={close} />
                    </button>
                  )}
                </div>
                <div className={styles.page}>{pages[currentPage]}</div>
              </div>
            </div>
          </FocusTrap>,
          document.body
        )}
    </>
  );
};

export default Modal;
