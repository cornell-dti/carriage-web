import React, { useState } from 'react';
import { RideType } from '@carriage-web/shared/types/ride';
import { DriverType } from '@carriage-web/shared/types/driver';
import { useRides } from '../../context/RidesContext';
import axios from '../../util/axios';
import SearchPopup from '../RideDetails/SearchPopup';
import { SearchableType } from '../../utils/searchConfig';
import { Box, Typography, Button, Paper } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

type AssignModalProps = {
  isOpen: boolean;
  close: () => void;
  ride: RideType;
  allDrivers: DriverType[];
  reassign: boolean;
  buttonRef: any;
};

const AssignDriverModal = ({
  isOpen,
  close,
  ride,
  allDrivers,
  reassign = false,
  buttonRef,
}: AssignModalProps) => {
  const { refreshRides } = useRides();
  const [selectedDriver, setSelectedDriver] = useState<DriverType | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // This function handles the backend call - same as before
  const addDriver = (driver: DriverType) => {
    axios
      .put(`/api/rides/${ride.id}`, {
        driver,
        type: !reassign ? 'active' : undefined,
      })
      .then(() => refreshRides());
    close();
  };

  // Handle driver selection from SearchPopup
  const handleDriverSelect = (driver: DriverType) => {
    setSelectedDriver(driver);
    setShowConfirmation(true);
  };

  // Handle confirmation
  const handleConfirm = () => {
    if (selectedDriver) {
      addDriver(selectedDriver);
    }
    setShowConfirmation(false);
    setSelectedDriver(null);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowConfirmation(false);
    setSelectedDriver(null);
  };

  return (
    <>
      <SearchPopup<DriverType>
        open={isOpen && !showConfirmation}
        onClose={close}
        onSelect={handleDriverSelect}
        items={allDrivers}
        searchType={SearchableType.DRIVER}
        loading={false}
        error={null}
        title={reassign ? 'Reassign Driver' : 'Assign Driver'}
        placeholder="Search drivers..."
        selectedItems={[]}
        anchorEl={buttonRef?.current}
      />

      {/* Confirmation Dialog */}
      {showConfirmation && selectedDriver && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 320,
            p: 3,
            zIndex: 1300,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {reassign ? 'Reassign Driver?' : 'Assign Driver?'}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {reassign ? 'Reassign' : 'Assign'} {selectedDriver.firstName}{' '}
            {selectedDriver.lastName} to this ride?
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={handleCancel}
              size="small"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckIcon />}
              onClick={handleConfirm}
              size="small"
            >
              {reassign ? 'Reassign' : 'Assign'}
            </Button>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default AssignDriverModal;
