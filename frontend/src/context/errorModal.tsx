import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Modal from '../components/Modal/Modal';

type ErrorModalState = {
  isOpen: boolean;
  title?: string;
  message?: React.ReactNode;
};

type ErrorModalContextValue = {
  showError: (message: React.ReactNode, title?: string) => void;
  hideError: () => void;
};

const ErrorModalContext = createContext<ErrorModalContextValue | undefined>(undefined);

let externalShowError: ((message: React.ReactNode, title?: string) => void) | null = null;

export const showGlobalError = (message: React.ReactNode, title?: string) => {
  if (externalShowError) {
    externalShowError(message, title);
  }
};

export const useErrorModal = (): ErrorModalContextValue => {
  const ctx = useContext(ErrorModalContext);
  if (!ctx) {
    throw new Error('useErrorModal must be used within an ErrorModalProvider');
  }
  return ctx;
};

type ProviderProps = {
  children: React.ReactNode;
  defaultTitle?: string;
};

export const ErrorModalProvider = ({ children, defaultTitle = 'Something went wrong' }: ProviderProps) => {
  const [state, setState] = useState<ErrorModalState>({ isOpen: false });

  const hideError = useCallback(() => {
    setState({ isOpen: false });
  }, []);

  const showError = useCallback((message: React.ReactNode, title?: string) => {
    setState({ isOpen: true, title: title || defaultTitle, message });
  }, [defaultTitle]);

  // Expose for non-React modules
  externalShowError = showError;

  const value = useMemo(() => ({ showError, hideError }), [showError, hideError]);

  return (
    <ErrorModalContext.Provider value={value}>
      {children}
      <Modal title={state.title || defaultTitle} isOpen={state.isOpen} onClose={hideError}>
        <div style={{ padding: '12px 4px' }}>{state.message}</div>
      </Modal>
    </ErrorModalContext.Provider>
  );
};

export const formatErrorMessage = (err: unknown): string => {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const anyErr: any = err as any;
    if (anyErr?.response?.data?.message) return anyErr.response.data.message;
    if (anyErr?.message) return anyErr.message as string;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return 'An unexpected error occurred.';
  }
};


