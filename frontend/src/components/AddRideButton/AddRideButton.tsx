import React, { useState } from 'react';
import RideDetailsComponent from '../RideDetails/RideDetailsComponent';
import { createEmptyRide } from '../../util/modelFixtures';
import { RideType } from '../../types';
import { useRides } from '../../context/RidesContext';
import buttonStyles from '../../styles/button.module.css';

const AddRideButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [emptyRide, setEmptyRide] = useState<RideType>(createEmptyRide());
  const [modalKey, setModalKey] = useState(0); // Key to force remount
  const { refreshRides } = useRides();

  const handleOpenModal = () => {
    setEmptyRide(createEmptyRide()); // Create fresh empty ride each time
    setModalKey((prev) => prev + 1); // Force remount of the modal
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleRideCreated = (newRide: RideType) => {
    refreshRides();
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={`${buttonStyles.buttonLarge} ${buttonStyles.button} ${buttonStyles.buttonPrimary}`}
      >
        + Add ride
      </button>
      <RideDetailsComponent
        key={modalKey} // Force remount when key changes
        open={open}
        onClose={handleCloseModal}
        ride={emptyRide}
        onRideUpdated={handleRideCreated}
        initialEditingState={true}
      />
    </>
  );
};

export default AddRideButton;
