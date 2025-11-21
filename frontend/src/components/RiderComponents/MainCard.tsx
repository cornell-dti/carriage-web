import React, { useState } from 'react';
import {
  format,
  isBefore,
  setHours,
  setMinutes,
  setSeconds,
  subDays,
} from 'date-fns';
import { Ride } from 'types';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';
import CallIcon from '@mui/icons-material/Call';
import CancelIcon from '@mui/icons-material/Cancel';
import styles from './maincard.module.css';
import DeleteOrEditTypeModal from 'components/Modal/DeleteOrEditTypeModal';
import RequestRideDialog from './RequestRideDialog';
import { useLocations } from 'context/LocationsContext';
import DriverInfoDialog from './DriverInfoDialog';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';

interface MainCardProps {
  ride: Ride;
}

const MainCard: React.FC<MainCardProps> = ({ ride }) => {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [openDeleteOrEditModal, setOpenDeleteOrEditModal] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [openDriverInfoDialog, setOpenDriverInfoDialog] = useState(false);
  const [adminContactOpen, setAdminContactOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { locations } = useLocations();
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, 'yyyy-MM-dd'),
      time: format(date, 'h:mm a'),
    };
  };

  const { date, time } = formatDateTime(ride.startTime);

  // Determine if this is a current ride or next ride
  const now = new Date().getTime();
  const startTime = new Date(ride.startTime).getTime();
  const endTime = new Date(ride.endTime).getTime();
  const isCurrentRide = startTime <= now && now < endTime;
  const cardTitle = isCurrentRide ? 'Current Ride' : 'Next Ride';

  const handleCancel = () => {
    // If ride is scheduled (has driver), show admin contact modal
    if (ride.driver) {
      setAdminContactOpen(true);
      return;
    }

    // For unscheduled rides, proceed with normal cancel flow
    const dayBefore10AM = setSeconds(
      setMinutes(setHours(subDays(new Date(ride.startTime), 1), 10), 0),
      0
    );
    const now = new Date();
    if (!isBefore(now, dayBefore10AM)) {
    }
    console.log(now);
    setCancelOpen(!cancelOpen);
  };

  const handleEdit = () => {
    // If ride is scheduled (has driver), show admin contact modal
    if (ride.driver) {
      setAdminContactOpen(true);
      return;
    }

    // For unscheduled rides, proceed with normal edit flow
    setEditOpen(!editOpen);
  };

  const handleContact = () => {
    setContactOpen(!contactOpen);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getDriverImageSrc = () => {
    if (!ride.driver?.photoLink || imageError) {
      return null;
    }
    // Add cache busting like other components
    return `${ride.driver.photoLink}?t=${new Date().getTime()}`;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>{cardTitle}</h2>
        <div className={styles.actions}>
          <button
            onClick={handleCancel}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            <CancelIcon fontSize="small" />
          </button>
          <DeleteOrEditTypeModal
            open={cancelOpen}
            ride={ride}
            onClose={() => {
              setCancelOpen(!cancelOpen);
            }}
            deleting={true}
            onNext={() => {
              setOpenDeleteOrEditModal(!openDeleteOrEditModal);
            }}
            isRider={true}
          />
          <button
            onClick={handleEdit}
            className={`${styles.button} ${styles.editButton}`}
          >
            <EditIcon fontSize="small" />
          </button>
          <RequestRideDialog
            open={editOpen}
            onClose={() => {
              setEditOpen(!editOpen);
            }}
            onSubmit={() => {
              setOpenEditModal(!openEditModal);
            }}
            ride={ride}
            supportedLocations={locations
              .map((l) => ({
                id: String(l.id),
                name: l.name,
                address: l.address,
                shortName: l.shortName,
                info: l.info ?? '',
                tag: (l.tag as any) ?? '',
                lat: Number(l.lat),
                lng: Number(l.lng),
                photoLink: l.photoLink,
                images: l.images,
              }))
              .filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng))}
          />
          {ride.driver && (
            <>
              <button
                onClick={handleContact}
                className={`${styles.button} ${styles.contactButton}`}
              >
                <CallIcon fontSize="small" />
              </button>
              <DriverInfoDialog
                open={contactOpen}
                onClose={() => {
                  setContactOpen(!contactOpen);
                }}
                onSubmit={() => {
                  setOpenDriverInfoDialog(!openDriverInfoDialog);
                }}
                driverInfo={ride.driver}
              />
            </>
          )}
        </div>
      </div>

      <div className={styles.contentRow}>
        {/* Destination Information */}
        <div className={styles.section}>
          <div className={styles.detail}>
            <CalendarMonthIcon fontSize="small" />
            <span className={styles.label}>Date:</span>
            <span>{date}</span>
          </div>
          <div className={styles.detail}>
            <AccessTimeIcon fontSize="small" />
            <span className={styles.label}>Time:</span>
            <span>{time}</span>
          </div>
          <div className={styles.detail}>
            <LocationOnIcon fontSize="small" />
            <span className={styles.label}>Pick-up:</span>
            <span>{ride.startLocation.name}</span>
          </div>
          <div className={styles.detail}>
            <LocationOnIcon fontSize="small" />
            <span className={styles.label}>Drop-off:</span>
            <span>{ride.endLocation.name}</span>
          </div>
        </div>

        {/* Driver Information or Scheduling Status */}
        <div className={styles.section}>
          {ride.driver ? (
            <div className={styles.driverInfo}>
              <div className={styles.driverImageContainer}>
                {getDriverImageSrc() ? (
                  <img
                    src={getDriverImageSrc()!}
                    alt={`${ride.driver.firstName} ${ride.driver.lastName}`}
                    className={styles.driverImage}
                    onError={handleImageError}
                  />
                ) : (
                  <div className={styles.driverImagePlaceholder}>
                    <PersonIcon fontSize="large" />
                  </div>
                )}
              </div>
              <div className={styles.driverDetails}>
                <div className={styles.detail}>
                  <PersonIcon fontSize="small" />
                  <span className={styles.label}>Name:</span>
                  <span>
                    {ride.driver.firstName} {ride.driver.lastName}
                  </span>
                </div>
                <div className={styles.detail}>
                  <PhoneIcon fontSize="small" />
                  <span className={styles.label}>Phone:</span>
                  <span>{ride.driver.phoneNumber}</span>
                </div>
                <div className={styles.detail}>
                  <EmailIcon fontSize="small" />
                  <span className={styles.label}>Email:</span>
                  <span>{ride.driver.email}</span>
                </div>
                <div className={styles.status}>
                  Status: {ride.status.replace('_', ' ')}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.driverInfo}>
              <div className={styles.driverDetails}>
                <div className={styles.detail}>
                  <PersonIcon fontSize="small" />
                  <span className={styles.label}>Scheduling:</span>
                  <span>Unscheduled</span>
                </div>
                <div className={styles.status}>
                  Status: {ride.status.replace('_', ' ')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Contact Modal */}
      <Dialog
        open={adminContactOpen}
        onClose={() => setAdminContactOpen(false)}
        aria-labelledby="admin-contact-dialog-title"
      >
        <DialogTitle id="admin-contact-dialog-title">
          Contact Administrator
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography variant="body1" sx={{ mb: 2 }}>
              This ride has been scheduled and a driver has been assigned. To
              cancel or edit this ride, please contact the administrator.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', mb: 1 }}
              >
                Administrator Contact:
              </Typography>
              <Typography variant="body2">Email: admin@carriage.com</Typography>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminContactOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MainCard;
