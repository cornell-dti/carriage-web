import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { RideType, Status, SchedulingState, Type } from '../../types';
import axios from '../../util/axios';

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
  userRole: 'rider' | 'driver' | 'admin';
}

const RideEditContext = createContext<RideEditContextType | undefined>(undefined);

interface RideEditProviderProps {
  children: ReactNode;
  ride: RideType;
  userRole: 'rider' | 'driver' | 'admin';
  onRideUpdated?: (updatedRide: RideType) => void;
}

export const RideEditProvider: React.FC<RideEditProviderProps> = ({
  children,
  ride,
  userRole,
  onRideUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRide, setEditedRide] = useState<RideType | null>(null);
  const [originalRide, setOriginalRide] = useState<RideType | null>(null);

  // Determine if user can edit based on role and ride state
  const canEdit = useCallback(() => {
    if (userRole === 'driver') return false; // Drivers cannot edit rides
    if (userRole === 'rider') {
      // Riders can only edit unscheduled rides
      return ride.schedulingState === SchedulingState.UNSCHEDULED;
    }
    if (userRole === 'admin') {
      // Admins can edit any ride
      return true;
    }
    return false;
  }, [userRole, ride.schedulingState]);

  const startEditing = useCallback(() => {
    if (!canEdit()) return;
    
    setOriginalRide({ ...ride });
    setEditedRide({ ...ride });
    setIsEditing(true);
  }, [ride, canEdit]);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
    setEditedRide(null);
    setOriginalRide(null);
  }, []);

  const updateRideField = useCallback((field: keyof RideType, value: any) => {
    if (!editedRide) return;
    
    setEditedRide(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  }, [editedRide]);

  const hasChanges = useCallback(() => {
    if (!editedRide || !originalRide) return false;
    
    // Deep comparison for nested objects
    const compareObjects = (obj1: any, obj2: any): boolean => {
      if (obj1 === obj2) return true;
      if (obj1 == null || obj2 == null) return false;
      if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
      
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      
      if (keys1.length !== keys2.length) return false;
      
      for (let key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!compareObjects(obj1[key], obj2[key])) return false;
      }
      
      return true;
    };

    // Check if any field has changed
    const fieldsToCheck: (keyof RideType)[] = [
      'startTime', 'endTime', 'startLocation', 'endLocation', 
      'status', 'schedulingState', 'type', 'driver'
    ];

    for (const field of fieldsToCheck) {
      if (!compareObjects(editedRide[field], originalRide[field])) {
        return true;
      }
    }

    return false;
  }, [editedRide, originalRide]);

  const saveChanges = useCallback(async (): Promise<boolean> => {
    if (!editedRide || !originalRide || !hasChanges()) {
      return false;
    }

    try {
      // Prepare the update payload
      const updatePayload: any = {};
      
      // Only include changed fields
      const fieldsToCheck: (keyof RideType)[] = [
        'startTime', 'endTime', 'startLocation', 'endLocation', 
        'status', 'schedulingState', 'type', 'driver'
      ];

      for (const field of fieldsToCheck) {
        if (JSON.stringify(editedRide[field]) !== JSON.stringify(originalRide[field])) {
          updatePayload[field] = editedRide[field];
        }
      }

      // Special handling for driver removal
      if (originalRide.driver && !editedRide.driver) {
        updatePayload.$REMOVE = ['driver'];
      }

      // Make API call to update ride
      const response = await axios.put(`/api/rides/${ride.id}`, updatePayload);
      
      // Update the context with the response
      if (onRideUpdated) {
        onRideUpdated(response.data);
      }
      
      stopEditing();
      return true;
    } catch (error) {
      console.error('Failed to save ride changes:', error);
      return false;
    }
  }, [editedRide, originalRide, hasChanges, ride.id, onRideUpdated, stopEditing]);

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
