import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Link,
  Box,
} from '@mui/material';
import { DriverType } from '@carriage-web/shared/types/driver';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

interface DriverInfoDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  driverInfo?: DriverType;
}

/**
 * DriverInfoDialog component displays driver's contact information in a dialog.
 *
 * @remarks  This component is used on the Rider's page when they have an upcoming
 * ride, and they want to contact the driver or see their information. It uses
 * Material UI for consistent styling.
 * @param props - Contains:
 * - open: boolean - Controls the visibility of the dialog.
 * - onClose: function - Function to close the dialog.
 * - onSubmit: function - Function to handle form submission.
 * - driverInfo: Driver - Contains driver's information such as name, email, and phone number.
 */
const DriverInfoDialog: React.FC<DriverInfoDialogProps> = ({
  open,
  onClose,
  onSubmit,
  driverInfo,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="driver-info-dialog-title"
    >
      <DialogTitle id="driver-info-dialog-title">
        Driver Information
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <CircularProgress />
          </div>
        ) : error ? (
          <DialogContentText color="error">{error}</DialogContentText>
        ) : driverInfo ? (
          <>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="subtitle1" color="text.secondary">
                  {driverInfo.firstName} {driverInfo.lastName}
                </Typography>
              </Box>

              <Divider />
            </Box>
            <ListItem
              sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
            >
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Contact
              </Typography>

              <Box
                sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
              >
                <Link
                  href={`mailto:${driverInfo.email}`}
                  color="primary"
                  display="inline-flex"
                  alignItems="center"
                  sx={{
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                    mb: 2,
                  }}
                >
                  <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                  {driverInfo.email}
                </Link>

                <Link
                  href={`tel:${driverInfo.phoneNumber}`}
                  color="primary"
                  display="inline-flex"
                  alignItems="center"
                  sx={{
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                  {driverInfo.phoneNumber}
                </Link>
              </Box>
            </ListItem>
          </>
        ) : (
          <DialogContentText>
            No driver information available.
          </DialogContentText>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() => {
            onClose();
          }}
          color="primary"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DriverInfoDialog;
