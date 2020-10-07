import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../FormElements/FormElements';
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
    <div>
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
  form?: boolean;
  children: React.ReactNode;
  onNext?: (page: number) => boolean | Promise<boolean>;
  onAccept?: (e: React.FormEvent) => void;
  onCancel?: () => void;
};

const Modal = ({
  title,
  isOpen,
  paginate = false,
  form = false,
  children,
  onNext = () => true,
  onAccept = () => {},
  onCancel = () => {},
}: ModalProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  // Wrapping children in Array to match type for numPages
  const pages = paginate ? (children as React.ReactNodeArray) : [children];
  const numPages = pages.length;
  const hasPagesLeft = paginate && currentPage < numPages - 1;

  const goNextPage = () => {
    // Only move onto next page after validation in onNext occurs (if any)
    if (onNext(currentPage)) {
      setCurrentPage((p) => (p + 1 < numPages ? p + 1 : p));
    }
  };

  // Reset the modal to the first page everytime it's opened
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(0);
    }
  }, [isOpen]);

  const ModalInner = () => (
    <>
      <div className={styles.topContainer}>
        <h1 className={styles.title}>
          {typeof title === 'string' ? title : title[currentPage]}
        </h1>
        <button onClick={onCancel}>Cancel</button>
      </div>
      {pages[currentPage]}
      <div className={styles.bottomContainer}>
        {hasPagesLeft ? (
          <Button type="button" onClick={goNextPage}>
            Next
          </Button>
        ) : (
          <Button type="submit">Accept</Button>
        )}
        {paginate && <PageIndicators pages={numPages} current={currentPage} />}
      </div>
    </>
  );

  const ModalPortal = () => (
    <div className={styles.background}>
      <div className={styles.modal}>
        {form ? (
          <form onSubmit={onAccept}>
            <ModalInner />
          </form>
        ) : (
          <ModalInner />
        )}
      </div>
    </div>
  );

  return isOpen ? createPortal(<ModalPortal />, document.body) : null;
};

export default Modal;
