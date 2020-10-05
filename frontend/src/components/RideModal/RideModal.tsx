import React, { useState } from 'react';
import Modal from '../Modal/Modal';

const RideModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const onNext = (page: number) => true;
  const onAccept = () => setIsOpen(false);
  const onCancel = () => setIsOpen(false);

  return (
    <>
      <button onClick={openModal}>open modal</button>
      <Modal
        paginate
        title={['Add a Ride', 'Available Drivers', 'Add a Ride']}
        isOpen={isOpen}
        onNext={onNext}
        onAccept={onAccept}
        onCancel={onCancel}
      >
        <h2>page 1</h2>
        <h2>page 2</h2>
        <h2>page 3</h2>
      </Modal>
    </>
  );
};

export default RideModal;
