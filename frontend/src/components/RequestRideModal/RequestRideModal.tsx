import React, { useEffect, useState } from 'react';
import { Ride } from '../../types';
import { RideModalType } from './types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import CreateOrEditRideModal from './CreateOrEditRideModal';
import { useToast, ToastStatus } from '../../context/toastContext';

type RequestRideModalProps = {
  onSubmit?: () => void;
  ride?: Ride;
};

const RequestRideModal = ({
  onSubmit = () => {},
  ride,
}: RequestRideModalProps) => {
  const [modalType, setModalType] = useState<RideModalType>();
  const [typeModalIsOpen, setTypeModalIsOpen] = useState(false);
  const [createOrEditModalIsOpen, setCreateOrEditModalIsOpen] = useState(false);
  const { showToast } = useToast();

  const openTypeModal = () => {
    setTypeModalIsOpen(true);
  };

  const closeTypeModal = () => {
    setTypeModalIsOpen(false);
  };

  const openCreateOrEditModal = (newModalType: RideModalType) => {
    setModalType(newModalType);
    setCreateOrEditModalIsOpen(true);
  };

  const closeCreateOrEditModal = () => {
    setCreateOrEditModalIsOpen(false);
  };

  const handleSubmit = () => {
    showToast(
      `Your ride has been ${!ride ? 'created' : 'edited'}`,
      ToastStatus.SUCCESS
    );
    onSubmit();
  };

  useEffect(() => {
    if (!createOrEditModalIsOpen) {
      setModalType(undefined);
    }
  }, [createOrEditModalIsOpen]);

  return (
    <>
      {!ride ? (
        <Button
          variant="contained"
          color="primary"
          onClick={() => openCreateOrEditModal('CREATE')}
        >
          + Request a ride
        </Button>
      ) : (
        <Button
          variant="outlined"
          size="small"
          onClick={
            ride.recurring
              ? openTypeModal
              : () => openCreateOrEditModal('EDIT_REGULAR')
          }
        >
          Edit
        </Button>
      )}
      {ride && ride.recurring && (
        <Dialog open={typeModalIsOpen} onClose={closeTypeModal}>
          <DialogTitle>Choose Edit Type</DialogTitle>
          <DialogContent>
            {}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                closeTypeModal();
                openCreateOrEditModal('EDIT_SINGLE_RECURRING');
              }}
            >
              Edit Single
            </Button>
            <Button
              onClick={() => {
                closeTypeModal();
                openCreateOrEditModal('EDIT_ALL_RECURRING');
              }}
            >
              Edit All
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {modalType && (
        <CreateOrEditRideModal
          isOpen={createOrEditModalIsOpen}
          onClose={closeCreateOrEditModal}
          onSubmit={handleSubmit}
          ride={ride}
          modalType={modalType}
        />
      )}
    </>
  );
};

export default RequestRideModal;
