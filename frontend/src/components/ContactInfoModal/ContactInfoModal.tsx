import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { Rider } from '../../types';

interface ContactInfoModalProps {
  open: boolean;
  onClose: () => void;
  rider: Rider | undefined;
}

const ContactInfoModal: React.FC<ContactInfoModalProps> = ({
  open,
  onClose,
  rider,
}) => {
  if (!rider) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={rider.photoLink} sx={{ width: 40, height: 40, mr: 2 }}>
            {rider.firstName.charAt(0)}
            {rider.lastName.charAt(0)}
          </Avatar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {rider.firstName} {rider.lastName}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <List>
          <ListItem>
            <ListItemIcon>
              <PhoneIcon />
            </ListItemIcon>
            <ListItemText
              primary="Phone Number"
              secondary={rider.phoneNumber || 'Not provided'}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <EmailIcon />
            </ListItemIcon>
            <ListItemText primary="Email" secondary={rider.email} />
          </ListItem>
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default ContactInfoModal;
