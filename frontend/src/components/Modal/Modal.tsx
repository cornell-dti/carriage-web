import React, { useState } from 'react';

type ModalProps = {
  onAccept?: () => void;
  onClose?: () => void;
  title: string | string[];
  isOpen: boolean;
  paginate?: boolean;
  children: React.ReactNode;
}

const Modal = ({
  onAccept = () => { },
  onClose = () => { },
  title,
  isOpen,
  paginate = false,
  children,
}: ModalProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pages = paginate ? children as React.ReactNodeArray : [children];
  const numPages = pages.length;

  const goForward = () => {
    setCurrentPage((p) => (p + 1 < numPages ? p + 1 : p));
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
              ? <button onClick={goForward}>Next</button>
              : <button onClick={() => beforeClose(onAccept)}>Accept</button>
          }
          <button onClick={() => beforeClose(onClose)}>Close</button>
        </div>
      )}
    </>
  );
};

export default Modal;
