import React from 'react';
import { createPortal } from 'react-dom';
import styles from './modal.module.css';

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
};

const Modal = ({
  title,
  isOpen,
  paginate = false,
  currentPage = 0,
  children,
  onClose = () => { },
}: ModalProps) => {
  // Wrapping children in Array to match type for numPages
  const pages = paginate ? (children as React.ReactNodeArray) : [children];
  const numPages = pages.length;
  const currentTitle = title === 'string' ? title : title[currentPage];

  return (
    <>
      {isOpen
        && createPortal(
          <div className={styles.background}>
            <div className={styles.modal}>
              <div className={styles.topContainer}>
                <h1 className={styles.title}>{currentTitle}</h1>
                <button onClick={onClose}>Close</button>
              </div>
              {pages[currentPage]}
              {paginate && (
                <PageIndicators pages={numPages} current={currentPage} />
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default Modal;
