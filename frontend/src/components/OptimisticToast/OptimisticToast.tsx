import React, { useEffect, useState } from 'react';
import { useRiders } from '../../context/RidersContext';

interface OptimisticToastProps {
  message?: string;
}

const OptimisticToast: React.FC<OptimisticToastProps> = ({ message }) => {
  const { error, isOptimistic, pendingOperations } = useRiders();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'pending'>(
    'pending'
  );

  useEffect(() => {
    if (error) {
      setToastMessage(`Error: ${error.message}`);
      setToastType('error');
      setShowToast(true);

      // Auto-hide error toast after 5 seconds
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (isOptimistic && pendingOperations.length > 0) {
      const latestOperation = pendingOperations[pendingOperations.length - 1];

      switch (latestOperation.type) {
        case 'UPDATE_RIDER_ACTIVE':
          setToastMessage('Updating rider status...');
          break;
        case 'UPDATE_RIDER_INFO':
          setToastMessage('Updating rider information...');
          break;
        case 'CREATE_RIDER':
          setToastMessage('Creating new rider...');
          break;
        case 'DELETE_RIDER':
          setToastMessage('Deleting rider...');
          break;
        default:
          setToastMessage(message || 'Updating...');
      }

      setToastType('pending');
      setShowToast(true);
    } else if (!isOptimistic && showToast && toastType === 'pending') {
      // Operation completed successfully
      setToastMessage('Operation completed successfully');
      setToastType('success');

      // Auto-hide success toast after 2 seconds
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOptimistic, pendingOperations, message, showToast, toastType]);

  if (!showToast) return null;

  const getToastStyles = () => {
    const baseStyles =
      'fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 max-w-sm transition-all duration-300 transform';

    switch (toastType) {
      case 'success':
        return `${baseStyles} bg-green-100 text-green-800 border border-green-200`;
      case 'error':
        return `${baseStyles} bg-red-100 text-red-800 border border-red-200`;
      case 'pending':
        return `${baseStyles} bg-blue-100 text-blue-800 border border-blue-200`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  };

  const getIcon = () => {
    switch (toastType) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{getIcon()}</span>
        <span className="text-sm font-medium">{toastMessage}</span>
        {toastType === 'error' && (
          <button
            onClick={() => setShowToast(false)}
            className="ml-2 text-red-600 hover:text-red-800 font-bold text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default OptimisticToast;
