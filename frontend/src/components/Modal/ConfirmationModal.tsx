import React from 'react';
import Modal from './Modal';
import { Button } from '../FormElements/FormElements';
import { useRiders } from '../../context/RidersContext';
import { User } from '../../types/index';
import { useNavigate } from 'react-router-dom';
import { ToastStatus, useToast } from '../../context/toastContext';
import { useEmployees } from '../../context/EmployeesContext';
import axios from '../../util/axios';

type ConfirmationProps = {
  open: boolean;
  onClose: () => void;
  role?: string; // 'admin', 'driver', 'both', or undefined if rider
  user: User;
};

const ConfirmationModal = ({
  open,
  onClose,
  role,
  user,
}: ConfirmationProps) => {
  const { refreshRiders } = useRiders();
  const { refreshDrivers, refreshAdmins } = useEmployees();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const closeModal = () => {
    onClose();
  };

  // userType should be either 'admin', 'driver', 'rider'
  const deleteAPICall = (
    userType: string,
    userId: string,
    refreshFunc: () => Promise<void>
  ) => {
    const userGroup = `${userType}s`;
    axios
      .delete(`/api/${userGroup}/${userId ? userId : ''}`)
      .then(refreshFunc)
      .then(() => {
        // Navigate to the appropriate page after deletion
        navigate(`/${userType === 'rider' ? 'riders' : 'employees'}`);
        showToast(`The ${userType} has been deleted.`, ToastStatus.SUCCESS);
        closeModal();
      });
  };

  const userDelete = () => {
    if (role === 'admin') {
      deleteAPICall(role, user.id, refreshAdmins);
    } else if (role === 'driver') {
      deleteAPICall(role, user.id, refreshDrivers);
    } else if (role === 'both') {
      // Delete from both drivers & admins
      deleteAPICall('driver', user.id, refreshDrivers);
      axios.delete(`/api/admins/${user.id ? user.id : ''}`).then(refreshAdmins);
    } else {
      deleteAPICall('rider', user.id, refreshRiders);
    }
  };

  return (
    <Modal
      title=""
      isOpen={open}
      onClose={closeModal}
      displayClose={true}
      arialabelledby="confirm-text"
    >
      <div className="w-72 flex flex-col">
        <p className="text-center text-[1.4rem] font-normal" id="confirm-text">
          Are you sure you want to remove {user.firstName} {user.lastName}?
        </p>
        <div className="pt-6 flex justify-between">
          <Button
            type="button"
            onClick={closeModal}
            className="bg-white text-black border border-black ml-[1.4rem] font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={userDelete}
            className="bg-[#eb0023] text-white border border-[#eb0023] ml-8 font-medium"
          >
            Remove
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
