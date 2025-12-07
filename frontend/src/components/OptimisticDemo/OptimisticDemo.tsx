import React from 'react';
import { useRiders } from '../../context/RidersContext';
import { useErrorModal, formatErrorMessage } from '../../context/errorModal';

const OptimisticDemo: React.FC = () => {
  const { riders, isOptimistic, pendingOperations, updateRiderActive, error } =
    useRiders();
  const { showError } = useErrorModal();

  const handleDemoToggle = async () => {
    if (riders.length > 0) {
      const firstRider = riders[0];
      try {
        await updateRiderActive(firstRider.id, !firstRider.active);
      } catch (err) {
        console.error('Demo failed:', err);
        showError(`Demo failed: ${formatErrorMessage(err)}`, 'Demo Error');
      }
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Optimistic UI Demo</h3>

      <div className="mb-4">
        <p>
          <strong>Riders Count:</strong> {riders.length}
        </p>
        <p>
          <strong>Is Optimistic:</strong> {isOptimistic ? 'Yes' : 'No'}
        </p>
        <p>
          <strong>Pending Operations:</strong> {pendingOperations.length}
        </p>
        {error && (
          <p className="text-red-600">
            <strong>Error:</strong> {error.message}
          </p>
        )}
      </div>

      <button
        onClick={handleDemoToggle}
        disabled={isOptimistic || riders.length === 0}
        className={`px-4 py-2 rounded-lg font-medium ${
          isOptimistic || riders.length === 0
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isOptimistic ? 'Updating...' : 'Toggle First Rider Status'}
      </button>

      {riders.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold">First Rider:</h4>
          <p>
            {riders[0].firstName} {riders[0].lastName} -
            <span
              className={`ml-2 px-2 py-1 rounded text-xs ${
                riders[0].active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {riders[0].active ? 'Active' : 'Inactive'}
            </span>
          </p>
        </div>
      )}

      {pendingOperations.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold">Pending Operations:</h4>
          {pendingOperations.map((op, index) => (
            <div key={op.id} className="text-sm bg-blue-50 p-2 rounded mt-1">
              {index + 1}. {op.type} (ID: {op.id.substring(0, 8)}...)
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OptimisticDemo;
