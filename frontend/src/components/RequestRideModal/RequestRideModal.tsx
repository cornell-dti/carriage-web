import React, { useEffect, useState } from 'react';
import { Ride } from '../../types';
import { RideModalType } from './types';
import DeleteOrEditTypeModal from '../Modal/DeleteOrEditTypeModal';
import { Button } from '../FormElements/FormElements';
import CreateOrEditRideModal from './CreateOrEditRideModal';
import Toast from '../ConfirmationToast/ConfirmationToast';

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
  const [showingToast, setToast] = useState(false);

  const openTypeModal = () => {
    setTypeModalIsOpen(true);
  };

  const closeTypeModal = () => {
    setTypeModalIsOpen(false);
  };

  const openCreateOrEditModal = (newModalType: RideModalType) => {
    setToast(false);
    setModalType(newModalType);
    setCreateOrEditModalIsOpen(true);
  };

  const closeCreateOrEditModal = () => {
    setCreateOrEditModalIsOpen(false);
  };

  const handleSubmit = () => {
    setToast(true);
    onSubmit();
  };

  useEffect(() => {
    if (!createOrEditModalIsOpen) {
      setModalType(undefined);
    }
  }, [createOrEditModalIsOpen]);

  return (
    <>
      {showingToast ? (
        <Toast message={`Your ride has been ${!ride ? 'created' : 'edited'}`} />
      ) : null}
      {!ride ? (
        <Button onClick={() => openCreateOrEditModal('CREATE')}>
          + Request a ride
        </Button>
      ) : (
        <Button
          outline
          small
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
        <DeleteOrEditTypeModal
          open={typeModalIsOpen}
          onClose={closeTypeModal}
          ride={ride}
          deleting={false}
          onNext={(single) => {
            closeTypeModal();
            openCreateOrEditModal(
              single ? 'EDIT_SINGLE_RECURRING' : 'EDIT_ALL_RECURRING'
            );
          }}
        />
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
