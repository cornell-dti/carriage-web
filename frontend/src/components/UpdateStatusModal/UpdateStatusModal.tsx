import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from '@mui/material';
import { Status } from '../../types';

interface UpdateStatusModalProps {
  open: boolean;
  onClose: () => void;
  currentStatus: Status;
  nextStatuses: Status[];
  onUpdate: (newStatus: Status) => void | Promise<void>;
  updating: boolean;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  open,
  onClose,
  currentStatus,
  nextStatuses,
  onUpdate,
  updating,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<Status | ''>('');

  useEffect(() => {
    if (!open) {
      setSelectedStatus('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedStatus) return;
    await onUpdate(selectedStatus as Status);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Update Ride Status</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" gutterBottom>
          Current status: <strong>{currentStatus.replace(/_/g, ' ')}</strong>
        </Typography>
        <FormControl
          component="fieldset"
          sx={{ mt: 2 }}
          disabled={updating || nextStatuses.length === 0}
        >
          <FormLabel component="legend">Select new status</FormLabel>
          <RadioGroup
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as Status)}
          >
            {nextStatuses.length > 0 ? (
              nextStatuses.map((status) => (
                <FormControlLabel
                  key={status}
                  value={status}
                  control={<Radio />}
                  label={status.replace(/_/g, ' ')}
                />
              ))
            ) : (
              <Typography variant="body2" sx={{ mt: 1 }}>
                No status options available.
              </Typography>
            )}
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={updating}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedStatus || updating || nextStatuses.length === 0}
          startIcon={updating ? <CircularProgress size={20} /> : undefined}
        >
          {updating ? 'Updating...' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateStatusModal;
