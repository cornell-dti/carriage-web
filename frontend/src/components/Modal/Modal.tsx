import React, { useEffect } from 'react';
import FocusTrap from 'focus-trap-react';
import { createPortal } from 'react-dom';
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
    <div className="flex justify-center">
      {indicators.map((_, i) => (
        <span
          key={String(i)}
          className="h-1.5 w-1.5 mx-1 rounded-full inline-block"
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
          <div className="fixed bg-[rgba(13,13,13,0.6)] top-0 left-0 h-full w-full z-1000">
            <FocusTrap
              focusTrapOptions={{
                onDeactivate: onClose,
                returnFocusOnDeactivate: true,
                clickOutsideDeactivates: true,
              }}
            >
              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white py-8 px-9 rounded-2xl z-1010 max-sm:max-w-full max-sm:max-h-full max-sm:overflow-y-scroll [@media(max-height:600px)]:max-w-full [@media(max-height:600px)]:max-h-full [@media(max-height:600px)]:overflow-y-scroll">
                <div className="flex justify-between items-center sticky top-0 z-1 pb-3 bg-white">
                  {isRider ? (
                    <h1 className="text-[1.75rem] m-0" id={id}>
                      {currentTitle}
                    </h1>
                  ) : (
                    <div className="text-[1.75rem] m-0" id={id}>
                      {currentTitle}
                    </div>
                  )}
                  {!displayClose && isRider && (
                    <button
                      className="border-0 cursor-pointer bg-transparent p-0 ml-3 focus:[outline:3px_solid_black]"
                      id={'close'}
                      onClick={onClose}
                    >
                      <img alt="close" src={close} />
                    </button>
                  )}
                </div>
                <div className="my-3 relative max-sm:max-w-full max-sm:block max-sm:m-0 [@media(max-height:600px)]:max-w-full [@media(max-height:600px)]:block [@media(max-height:600px)]:m-0">
                  {pages[currentPage]}
                </div>
              </div>
            </FocusTrap>
          </div>,
          document.body
        )}
    </>
  );
};

export default Modal;
