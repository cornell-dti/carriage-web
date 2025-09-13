import { useState, useCallback, useRef } from 'react';

export interface OptimisticOperation<T> {
  id: string;
  type: string;
  data: T;
  timestamp: number;
}

export interface OptimisticUpdateOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error, rollbackData?: T) => void;
  timeout?: number;
}

export interface OptimisticState<T> {
  data: T;
  isOptimistic: boolean;
  pendingOperations: OptimisticOperation<Partial<T>>[];
  error: Error | null;
}

export function useOptimisticUpdate<T>(initialData: T) {
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isOptimistic: false,
    pendingOperations: [],
    error: null,
  });

  const operationsRef = useRef<Map<string, {
    rollbackData: T;
    timeout?: NodeJS.Timeout;
  }>>(new Map());

  const generateOperationId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  const applyOptimisticUpdate = useCallback((
    updates: Partial<T>,
    operation: string,
    options: OptimisticUpdateOptions<T> = {}
  ) => {
    const operationId = generateOperationId();
    const currentData = state.data;

    // Store rollback data
    operationsRef.current.set(operationId, {
      rollbackData: currentData,
    });

    // Apply optimistic update
    const optimisticData = { ...currentData, ...updates };
    const operationRecord: OptimisticOperation<Partial<T>> = {
      id: operationId,
      type: operation,
      data: updates,
      timestamp: Date.now(),
    };

    setState(prevState => ({
      ...prevState,
      data: optimisticData,
      isOptimistic: true,
      pendingOperations: [...prevState.pendingOperations, operationRecord],
      error: null,
    }));

    // Set timeout for automatic rollback if needed
    if (options.timeout) {
      const timeout = setTimeout(() => {
        rollbackOperation(operationId);
      }, options.timeout);

      const opData = operationsRef.current.get(operationId);
      if (opData) {
        operationsRef.current.set(operationId, {
          ...opData,
          timeout,
        });
      }
    }

    return operationId;
  }, [state.data, generateOperationId]);

  const confirmOperation = useCallback((
    operationId: string,
    serverData?: T,
    options: OptimisticUpdateOptions<T> = {}
  ) => {
    const operation = operationsRef.current.get(operationId);
    if (!operation) return;

    // Clear timeout if exists
    if (operation.timeout) {
      clearTimeout(operation.timeout);
    }

    // Remove from pending operations
    setState(prevState => {
      const updatedOperations = prevState.pendingOperations.filter(
        op => op.id !== operationId
      );

      return {
        ...prevState,
        data: serverData || prevState.data,
        isOptimistic: updatedOperations.length > 0,
        pendingOperations: updatedOperations,
        error: null,
      };
    });

    operationsRef.current.delete(operationId);

    if (options.onSuccess) {
      options.onSuccess(serverData || state.data);
    }
  }, [state.data]);

  const rollbackOperation = useCallback((
    operationId: string,
    error?: Error,
    options: OptimisticUpdateOptions<T> = {}
  ) => {
    const operation = operationsRef.current.get(operationId);
    if (!operation) return;

    // Clear timeout if exists
    if (operation.timeout) {
      clearTimeout(operation.timeout);
    }

    // Rollback to previous state
    setState(prevState => {
      const updatedOperations = prevState.pendingOperations.filter(
        op => op.id !== operationId
      );

      return {
        ...prevState,
        data: operation.rollbackData,
        isOptimistic: updatedOperations.length > 0,
        pendingOperations: updatedOperations,
        error: error || null,
      };
    });

    operationsRef.current.delete(operationId);

    if (options.onError) {
      options.onError(error || new Error('Operation rolled back'), operation.rollbackData);
    }
  }, []);

  const rollbackAllOperations = useCallback(() => {
    // Clear all timeouts
    operationsRef.current.forEach(operation => {
      if (operation.timeout) {
        clearTimeout(operation.timeout);
      }
    });

    // Find the earliest rollback data (original state before all operations)
    const operations = Array.from(operationsRef.current.values());
    const originalData = operations.length > 0 ? operations[0].rollbackData : state.data;

    setState(prevState => ({
      ...prevState,
      data: originalData,
      isOptimistic: false,
      pendingOperations: [],
      error: new Error('All operations rolled back'),
    }));

    operationsRef.current.clear();
  }, [state.data]);

  const updateServerData = useCallback((newData: T) => {
    setState(prevState => ({
      ...prevState,
      data: newData,
      isOptimistic: prevState.pendingOperations.length > 0,
      error: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      error: null,
    }));
  }, []);

  return {
    ...state,
    applyOptimisticUpdate,
    confirmOperation,
    rollbackOperation,
    rollbackAllOperations,
    updateServerData,
    clearError,
  };
}