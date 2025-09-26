import React, { useEffect, useState } from 'react';
import { Ride } from '../../types';
import { RideModalType } from './types';
import DeleteOrEditTypeModal from '../Modal/DeleteOrEditTypeModal';
import { Button } from '../FormElements/FormElements';
import CreateOrEditRideModal from './CreateOrEditRideModal';
import { useToast, ToastStatus } from '../../context/toastContext';
import styles from './requestridemodal.module.css';

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
          className={styles.btn}
          onClick={() => openCreateOrEditModal('CREATE')}
        >
          + Request a ride
        </Button>
      ) : (
        <Button
          outline
          small
          onClick={
            ride.isRecurring
              ? openTypeModal
              : () => openCreateOrEditModal('EDIT_REGULAR')
          }
        >
          Edit
        </Button>
      )}
      {ride && ride.isRecurring && (
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
