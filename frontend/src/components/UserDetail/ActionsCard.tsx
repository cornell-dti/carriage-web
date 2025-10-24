import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Employee } from '../../types/index';
import { RiderType } from '@shared/types/rider';
import EmployeeModal from '../EmployeeModal/EmployeeModal';
import RiderModal from '../Modal/RiderModal';
import ConfirmationModal from '../Modal/ConfirmationModal';
import Toast from '../ConfirmationToast/ConfirmationToast';
import { useRiders } from '../../context/RidersContext';
import { ToastStatus, useToast } from '../../context/toastContext';
import styles from './UserDetailCards.module.css';

interface ActionsCardProps {
  user: Employee | RiderType;
  userType: 'employee' | 'rider';
  refreshUserData?: () => void;
}

const ActionsCard: React.FC<ActionsCardProps> = ({
  user,
  userType,
  refreshUserData,
}) => {
  const [isEmployeeOpen, setEmployeeOpen] = useState(false);
  const [isRiderOpen, setRiderOpen] = useState(false);
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { updateRiderActive } = useRiders();
  const { toastType } = useToast();

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 1000); // 1.5 seconds

      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const createEmployeeEntity = (employee: Employee) => {
    return {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      netId: (employee as any).netId || '',
      email: employee.email,
      phoneNumber: employee.phoneNumber.replaceAll('-', ''),
      ...(employee.availability || employee.startDate
        ? {
            driver: {
              availability: (employee.availability || []) as any[],
              startDate: employee.startDate || '',
            },
          }
        : {}),
      ...(employee.type
        ? {
            admin: {
              isDriver: employee.isDriver || false,
              type: employee.type || [],
            },
          }
        : {}),
      photoLink: employee.photoLink,
    };
  };

  const handleToggleActive = async () => {
    if (userType === 'rider') {
      const rider = user as RiderType;
      const { id, active } = rider;
      const newActiveStatus = !active;

      try {
        // Use optimistic update from context
        await updateRiderActive(id, newActiveStatus);

        // Show success message
        setToastMessage(
          `Rider ${newActiveStatus ? 'activated' : 'deactivated'}.`
        );
        setShowToast(true);

        // Note: No need to call refreshUserData() as the context update automatically
        // triggers the useUserDetailData hook to update the local user state
      } catch (error) {
        console.error('Error updating rider status:', error);
        setToastMessage(
          `Failed to ${newActiveStatus ? 'activate' : 'deactivate'} rider.`
        );
        setShowToast(true);
      }
    }
  };

  const handleEdit = () => {
    if (userType === 'employee') {
      setEmployeeOpen(true);
    } else {
      setRiderOpen(true);
    }
  };

  const handleDelete = () => {
    setConfirmationModalIsOpen(true);
  };

  const getUserRole = () => {
    if (userType === 'employee') {
      const employee = user as Employee;
      if (employee.isDriver && employee.type && employee.type.length > 0) {
        return 'both';
      } else if (employee.isDriver) {
        return 'driver';
      } else {
        return 'admin';
      }
    }
    return 'rider';
  };

  const rider = userType === 'rider' ? (user as RiderType) : undefined;
  const employee = userType === 'employee' ? (user as Employee) : undefined;

  return (
    <Card className={styles.userDetailCard}>
      <CardContent className="flex-1 flex flex-col p-0">
        <h3 className="text-md font-medium text-gray-900 mb-3">Actions</h3>

        <div className="flex flex-col gap-2 flex-grow justify-start">
          {showToast && rider && (
            <Toast
              message={toastMessage}
              toastType={toastType ? ToastStatus.SUCCESS : ToastStatus.ERROR}
            />
          )}

          {userType === 'rider' && rider && (
            <button
              onClick={handleToggleActive}
              className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
                rider.active
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {rider.active ? (
                <PersonOffIcon className="w-3 h-3" />
              ) : (
                <PersonAddIcon className="w-3 h-3" />
              )}
              {rider.active ? 'Deactivate' : 'Activate'}
            </button>
          )}

          <button
            onClick={handleEdit}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors w-full"
          >
            <EditIcon className="w-3 h-3" />
            Edit
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors w-full"
          >
            <DeleteIcon className="w-3 h-3" />
            Delete
          </button>
        </div>

        {employee && (
          <EmployeeModal
            existingEmployee={createEmployeeEntity(employee)}
            isOpen={isEmployeeOpen}
            setIsOpen={setEmployeeOpen}
          />
        )}

        {rider && (
          <RiderModal
            existingRider={rider}
            isRiderWeb={true}
            isOpen={isRiderOpen}
            setIsOpen={setRiderOpen}
          />
        )}

        <ConfirmationModal
          open={confirmationModalIsOpen}
          user={user}
          onClose={() => setConfirmationModalIsOpen(false)}
          role={getUserRole() as any}
        />
      </CardContent>
    </Card>
  );
};

export default ActionsCard;
