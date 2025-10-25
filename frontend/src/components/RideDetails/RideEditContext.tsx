import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { RideType, SchedulingState } from '../../types';
import axios from '../../util/axios';
import { canEditRide, UserRole } from '../../util/rideValidation';
import {
  isNewRide,
  hasRideChanges,
  getRideChanges,
} from '../../util/modelFixtures';
import { validateRideTimes } from './TimeValidation';
import { useRides } from '../../context/RidesContext';
import { useToast, ToastStatus } from '../../context/toastContext';

interface RideEditContextType {
  isEditing: boolean;
  editedRide: RideType | null;
  originalRide: RideType | null;
  startEditing: () => void;
  stopEditing: () => void;
  updateRideField: (field: keyof RideType, value: any) => void;
  saveChanges: () => Promise<boolean>;
  hasChanges: boolean;
  canEdit: boolean;
  userRole: UserRole;
}

const RideEditContext = createContext<RideEditContextType | undefined>(
  undefined
);

interface RideEditProviderProps {
  children: ReactNode;
  ride: RideType;
  userRole: UserRole;
  onRideUpdated?: (updatedRide: RideType) => void;
  initialEditingState?: boolean;
}

export const RideEditProvider: React.FC<RideEditProviderProps> = ({
  children,
  ride,
  userRole,
  onRideUpdated,
  initialEditingState = false,
}) => {
  const { updateRideInfo } = useRides();
  const { showToast } = useToast();

  // For new rides, automatically start in editing mode
  const shouldStartEditing = initialEditingState || isNewRide(ride);
  const [isEditing, setIsEditing] = useState(shouldStartEditing);
  const [editedRide, setEditedRide] = useState<RideType | null>(
    shouldStartEditing ? ride : null
  );
  const [originalRide, setOriginalRide] = useState<RideType | null>(
    shouldStartEditing && !isNewRide(ride) ? { ...ride } : null
  );

  // Reset state when ride changes (e.g., when modal is closed and reopened with new ride)
  useEffect(() => {
    const newShouldStartEditing = initialEditingState || isNewRide(ride);
    setIsEditing(newShouldStartEditing);
    setEditedRide(newShouldStartEditing ? ride : null);
    setOriginalRide(
      newShouldStartEditing && !isNewRide(ride) ? { ...ride } : null
    );
  }, [ride.id, initialEditingState]);

  // Determine if user can edit based on role and ride state
  const canEdit = useCallback(() => {
    // New rides can always be edited
    if (isNewRide(ride)) {
      return true;
    }
    return canEditRide(ride, userRole);
  }, [ride, userRole]);

  const startEditing = useCallback(() => {
    if (!canEdit()) {
      return;
    }

    setOriginalRide({ ...ride });
    setEditedRide({ ...ride });
    setIsEditing(true);
  }, [ride, canEdit]);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
    setEditedRide(null);
    setOriginalRide(null);
  }, []);

  const updateRideField = useCallback(
    (field: keyof RideType, value: any) => {
      if (!editedRide) return;

      setEditedRide((prev) => {
        if (!prev) return null;

        // Auto-update scheduling state when driver is assigned/removed
        if (field === 'driver') {
          const newSchedulingState = value
            ? SchedulingState.SCHEDULED
            : SchedulingState.UNSCHEDULED;
          return {
            ...prev,
            [field]: value,
            schedulingState: newSchedulingState,
          };
        }

        return { ...prev, [field]: value };
      });
    },
    [editedRide]
  );

  const hasChanges = useCallback(() => {
    if (!editedRide) {
      return false;
    }

    // For new rides, check if required fields are filled
    if (isNewRide(editedRide)) {
      const hasRequiredFields =
        editedRide.startLocation.id !== '' && editedRide.endLocation.id !== '';
      return hasRequiredFields;
    }

    if (!originalRide) {
      return false;
    }

    // Use the clean comparison utility
    const hasChangesResult = hasRideChanges(originalRide, editedRide);
    return hasChangesResult;
  }, [editedRide, originalRide]);

  const saveChanges = useCallback(async (): Promise<boolean> => {
    if (!editedRide) {
      return false;
    }

    // Validate ride times
    if (editedRide.startTime && editedRide.endTime) {
      const timeValidation = validateRideTimes(
        editedRide.startTime,
        editedRide.endTime,
        {
          allowPastTimes: !isNewRide(editedRide),
          maxDurationHours: 24,
          minDurationMinutes: 5,
        }
      );

      if (!timeValidation.isValid) {
        console.error('Time validation failed:', timeValidation.errors);
        const firstErr =
          timeValidation.errors[0]?.message || 'Invalid time values';
        showToast(firstErr, ToastStatus.ERROR);
        return false;
      }
    }

    // For new rides, we need different validation and payload
    if (isNewRide(editedRide)) {
      // Validate required fields for new ride
      if (
        !editedRide.startLocation.id ||
        !editedRide.endLocation.id ||
        !editedRide.startTime ||
        !editedRide.endTime
      ) {
        console.error('Missing required fields for new ride');
        showToast(
          'Please select pickup, dropoff, start time, and end time.',
          ToastStatus.ERROR
        );
        return false;
      }

      try {
        // Prepare payload for new ride creation
        const createPayload = {
          type: editedRide.type,
          schedulingState: editedRide.schedulingState,
          startTime: editedRide.startTime,
          endTime: editedRide.endTime,
          startLocation: editedRide.startLocation,
          endLocation: editedRide.endLocation,
          riders: editedRide.riders || [],
          driver: editedRide.driver || null,
          isRecurring: false,
        };

        // Create new ride
        const response = await axios.post('/api/rides', createPayload);

        // Update the context with the response
        if (onRideUpdated) {
          onRideUpdated(response.data);
        }

        stopEditing();
        return true;
      } catch (error: any) {
        console.error('Failed to create new ride:', error);
        const msg =
          error?.response?.data?.message ||
          error?.response?.data?.err ||
          'Failed to create ride.';
        showToast(msg, ToastStatus.ERROR);
        return false;
      }
    } else {
      // Existing ride update logic
      if (!originalRide || !hasChanges()) {
        return false;
      }

      try {
        // Prepare the update payload - only include changed fields (like the previous implementation)
        const updatePayload: any = {};

        // Only include changed fields - include riders for single rider updates
        const fieldsToCheck: (keyof RideType)[] = [
          'startTime',
          'endTime',
          'startLocation',
          'endLocation',
          'status',
          'schedulingState',
          'type',
          'driver',
          'riders',
        ];

        for (const field of fieldsToCheck) {
          if (
            JSON.stringify(editedRide[field]) !==
            JSON.stringify(originalRide[field])
          ) {
            updatePayload[field] = editedRide[field];
          }
        }

        // Special handling for driver removal
        if (originalRide.driver && !editedRide.driver) {
          updatePayload.$REMOVE = ['driver'];
        }

        // Use optimistic update from RidesContext
        await updateRideInfo(ride.id, updatePayload);

        // Update the context with the optimistically updated ride
        if (onRideUpdated) {
          onRideUpdated({ ...editedRide } as RideType);
        }

        stopEditing();
        return true;
      } catch (error: any) {
        console.error('Failed to save ride changes:', error);
        const msg =
          error?.response?.data?.message ||
          error?.response?.data?.err ||
          'Failed to save changes.';
        showToast(msg, ToastStatus.ERROR);
        return false;
      }
    }
  }, [
    editedRide,
    originalRide,
    hasChanges,
    ride.id,
    onRideUpdated,
    stopEditing,
    updateRideInfo,
    showToast,
  ]);

  const contextValue: RideEditContextType = {
    isEditing,
    editedRide: editedRide || ride,
    originalRide,
    startEditing,
    stopEditing,
    updateRideField,
    saveChanges,
    hasChanges: hasChanges(),
    canEdit: canEdit(),
    userRole,
  };

  return (
    <RideEditContext.Provider value={contextValue}>
      {children}
    </RideEditContext.Provider>
  );
};

export const useRideEdit = (): RideEditContextType => {
  const context = useContext(RideEditContext);
  if (context === undefined) {
    throw new Error('useRideEdit must be used within a RideEditProvider');
  }
  return context;
};
