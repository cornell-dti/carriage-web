import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
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
  const handleStatusSelect = async (newStatus: Status) => {
    await onUpdate(newStatus);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="xs"
    >
      <DialogTitle>Update Ride Status</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" gutterBottom>
          Current status: <strong>{currentStatus.replace(/_/g, ' ')}</strong>
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Select the status:
        </Typography>
        <List>
          {nextStatuses.length > 0 ? (
            nextStatuses.map((status) => (
              <ListItem key={status} disablePadding>
                <ListItemButton
                  onClick={() => handleStatusSelect(status)}
                  disabled={updating}
                >
                  <ListItemText primary={status.replace(/_/g, ' ')} />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No status options available." />
            </ListItem>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={updating}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateStatusModal;
