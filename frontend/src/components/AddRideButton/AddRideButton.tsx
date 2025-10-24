import React, { useState } from 'react';
import { Button } from '../FormElements/FormElements';
import RideDetailsComponent from '../RideDetails/RideDetailsComponent';
import { createEmptyRide } from '../../util/modelFixtures';
import { RideType } from '@shared/types/ride';
import { useRides } from '../../context/RidesContext';

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
      <Button onClick={handleOpenModal}>+ Add ride</Button>
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
