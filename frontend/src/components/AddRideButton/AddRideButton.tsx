import React, { useState } from 'react';
import RideDetailsComponent from '../RideDetails/RideDetailsComponent';
import { createEmptyRide } from '../../util/modelFixtures';
import { RideType } from '@carriage-web/shared/types/ride';
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
      <button
        onClick={handleOpenModal}
        className="w-32 h-10 flex items-center justify-center cursor-pointer rounded text-base whitespace-nowrap pl-6 pr-6 border border-[#303030] bg-black text-white transition-all duration-100 hover:bg-[#333] active:bg-[#555]"
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
