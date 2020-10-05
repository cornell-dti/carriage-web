import React, { useState } from 'react';
import Modal from '../Modal/Modal';

const RideModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => setIsOpen(false);
  const onAccept = () => onClose();
  const openModal = () => setIsOpen(true);

  return (
    <>
      <button onClick={openModal}>open modal</button>
      <Modal
        paginate
        title={['Add a Ride', 'Available Drivers', 'Add a Ride']}
        isOpen={isOpen}
        onAccept={onAccept}
        onClose={onClose}
      >
        <h2>page 1</h2>
        <h2>page 2</h2>
        <h2>page 3</h2>
      </Modal>
    </>
  );
};

export default RideModal;
