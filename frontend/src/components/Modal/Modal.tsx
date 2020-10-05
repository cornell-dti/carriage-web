import React, { useState } from 'react';

type ModalProps = {
  onNext?: (page: number) => boolean;
  onAccept?: () => void;
  onCancel?: () => void;
  title: string | string[];
  isOpen: boolean;
  paginate?: boolean;
  children: React.ReactNode;
}

const Modal = ({
  onNext = () => true,
  onAccept = () => { },
  onCancel = () => { },
  title,
  isOpen,
  paginate = false,
  children,
}: ModalProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pages = paginate ? children as React.ReactNodeArray : [children];
  const numPages = pages.length;

  const goNextPage = () => {
    if (onNext(currentPage)) {
      setCurrentPage((p) => (p + 1 < numPages ? p + 1 : p));
    }
  };
  const beforeClose = (func: () => void) => {
    setCurrentPage(0);
    func();
  };

  return (
    <>
      {isOpen && (
        <div>
          <h1>{typeof title === 'string' ? title : title[currentPage]}</h1>
          {pages[currentPage]}
          {
            paginate && currentPage < numPages - 1
              ? <button onClick={goNextPage}>Next</button>
              : <button onClick={() => beforeClose(onAccept)}>Accept</button>
          }
          <button onClick={() => beforeClose(onCancel)}>Cancel</button>
        </div>
      )}
    </>
  );
};

export default Modal;
