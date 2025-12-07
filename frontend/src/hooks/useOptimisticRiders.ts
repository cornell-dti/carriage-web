import { useCallback } from 'react';
import { Rider } from '../types/index';
import {
  useOptimisticUpdate,
  OptimisticUpdateOptions,
} from './useOptimisticUpdate';
import axios from '../util/axios';
import { showGlobalError, formatErrorMessage } from '../context/errorModal';

export interface RiderOperations {
  updateRiderActive: (riderId: string, active: boolean) => Promise<string>;
  updateRiderInfo: (
    riderId: string,
    updates: Partial<Rider>
  ) => Promise<string>;
  createRider: (rider: Omit<Rider, 'id'>) => Promise<string>;
  deleteRider: (riderId: string) => Promise<string>;
}

export function useOptimisticRiders(initialRiders: Rider[]) {
  const optimisticState = useOptimisticUpdate<Rider[]>(initialRiders);

  const findRiderIndex = useCallback(
    (riderId: string) => {
      return optimisticState.data.findIndex((rider) => rider.id === riderId);
    },
    [optimisticState.data]
  );

  const updateRiderActive = useCallback(
    async (
      riderId: string,
      active: boolean,
      options: OptimisticUpdateOptions<Rider[]> = {}
    ): Promise<string> => {
      const riderIndex = findRiderIndex(riderId);
      if (riderIndex === -1) {
        throw new Error('Rider not found');
      }

      const updatedRiders = [...optimisticState.data];
      updatedRiders[riderIndex] = { ...updatedRiders[riderIndex], active };

      const operationId = optimisticState.applyOptimisticUpdate(
        updatedRiders,
        'UPDATE_RIDER_ACTIVE',
        {
          ...options,
          timeout: options.timeout || 10000, // 10 second timeout
        }
      );

      try {
        // Make API call
        await axios.put(`/api/riders/${riderId}`, { active });

        // Confirm the operation was successful
        optimisticState.confirmOperation(operationId, updatedRiders, options);

        return operationId;
      } catch (error) {
        // Rollback on error
        optimisticState.rollbackOperation(
          operationId,
          error instanceof Error
            ? error
            : new Error('Failed to update rider status'),
          options
        );
        throw error;
      }
    },
    [optimisticState, findRiderIndex]
  );

  const updateRiderInfo = useCallback(
    async (
      riderId: string,
      updates: Partial<Rider>,
      options: OptimisticUpdateOptions<Rider[]> = {}
    ): Promise<string> => {
      const riderIndex = findRiderIndex(riderId);
      if (riderIndex === -1) {
        throw new Error('Rider not found');
      }

      const updatedRiders = [...optimisticState.data];
      updatedRiders[riderIndex] = { ...updatedRiders[riderIndex], ...updates };

      const operationId = optimisticState.applyOptimisticUpdate(
        updatedRiders,
        'UPDATE_RIDER_INFO',
        {
          ...options,
          timeout: options.timeout || 15000, // 15 second timeout for info updates
        }
      );

      try {
        // Make API call
        const response = await axios.put(`/api/riders/${riderId}`, updates);
        const serverRider = response.data.data;

        // Update with server data
        const finalRiders = [...optimisticState.data];
        finalRiders[riderIndex] = serverRider;

        optimisticState.confirmOperation(operationId, finalRiders, options);

        return operationId;
      } catch (error) {
        optimisticState.rollbackOperation(
          operationId,
          error instanceof Error
            ? error
            : new Error('Failed to update rider info'),
          options
        );
        throw error;
      }
    },
    [optimisticState, findRiderIndex]
  );

  const createRider = useCallback(
    async (
      rider: Omit<Rider, 'id'>,
      options: OptimisticUpdateOptions<Rider[]> = {}
    ): Promise<string> => {
      // Generate temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempRider: Rider = { ...rider, id: tempId };

      const updatedRiders = [...optimisticState.data, tempRider];

      const operationId = optimisticState.applyOptimisticUpdate(
        updatedRiders,
        'CREATE_RIDER',
        {
          ...options,
          timeout: options.timeout || 15000,
        }
      );

      try {
        // Make API call
        const response = await axios.post('/api/riders', rider);
        const serverRider = response.data.data;

        // Replace temp rider with server rider
        const finalRiders = optimisticState.data.map((r) =>
          r.id === tempId ? serverRider : r
        );

        optimisticState.confirmOperation(operationId, finalRiders, options);

        return operationId;
      } catch (error) {
        optimisticState.rollbackOperation(
          operationId,
          error instanceof Error ? error : new Error('Failed to create rider'),
          options
        );
        throw error;
      }
    },
    [optimisticState]
  );

  const deleteRider = useCallback(
    async (
      riderId: string,
      options: OptimisticUpdateOptions<Rider[]> = {}
    ): Promise<string> => {
      const riderIndex = findRiderIndex(riderId);
      if (riderIndex === -1) {
        throw new Error('Rider not found');
      }

      const updatedRiders = optimisticState.data.filter(
        (rider) => rider.id !== riderId
      );

      const operationId = optimisticState.applyOptimisticUpdate(
        updatedRiders,
        'DELETE_RIDER',
        {
          ...options,
          timeout: options.timeout || 10000,
        }
      );

      try {
        // Make API call
        await axios.delete(`/api/riders/${riderId}`);

        optimisticState.confirmOperation(operationId, updatedRiders, options);

        return operationId;
      } catch (error) {
        optimisticState.rollbackOperation(
          operationId,
          error instanceof Error ? error : new Error('Failed to delete rider'),
          options
        );
        throw error;
      }
    },
    [optimisticState, findRiderIndex]
  );

  const getRiderById = useCallback(
    (riderId: string): Rider | undefined => {
      return optimisticState.data.find((rider) => rider.id === riderId);
    },
    [optimisticState.data]
  );

  const refreshFromServer = useCallback(async () => {
    try {
      const response = await axios.get('/api/riders');
      const serverRiders: Rider[] = response.data.data;

      // Sort riders as done in original context
      serverRiders.sort((a: Rider, b: Rider) => {
        const aFull = `${a.firstName} ${a.lastName}`.toLowerCase();
        const bFull = `${b.firstName} ${b.lastName}`.toLowerCase();
        return aFull < bFull ? -1 : 1;
      });

      optimisticState.updateServerData(serverRiders);
    } catch (error) {
      console.error('Failed to refresh riders from server:', error);
      showGlobalError(
        `Failed to refresh riders from server: ${formatErrorMessage(error)}`,
        'Riders Error'
      );
      throw error;
    }
  }, [optimisticState]);

  return {
    riders: optimisticState.data,
    isOptimistic: optimisticState.isOptimistic,
    pendingOperations: optimisticState.pendingOperations,
    error: optimisticState.error,
    updateRiderActive,
    updateRiderInfo,
    createRider,
    deleteRider,
    getRiderById,
    refreshFromServer,
    rollbackAllOperations: optimisticState.rollbackAllOperations,
    clearError: optimisticState.clearError,
  };
}
