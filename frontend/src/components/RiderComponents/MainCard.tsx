import React, { useState } from 'react';
import {
  format,
  isBefore,
  setHours,
  setMinutes,
  setSeconds,
  subDays,
} from 'date-fns';
import { RideType } from '@carriage-web/shared/types/ride';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';
import CallIcon from '@mui/icons-material/Call';
import CancelIcon from '@mui/icons-material/Cancel';
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
  ride: RideType;
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
    <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] p-3 text-black h-fit max-h-50 overflow-y-auto">
      <div className="flex items-center relative pb-2 mb-2 border-b border-[#f0f0f0]">
        <h2 className="m-0 text-[1.1rem] text-[#333] flex-1">{cardTitle}</h2>
        <div className="flex gap-1 ml-auto max-md:absolute max-md:right-0 max-md:top-0">
          <button
            onClick={handleCancel}
            className="p-1 border-0 rounded-sm cursor-pointer bg-transparent transition-colors duration-200 flex items-center justify-center hover:bg-[rgba(255,77,79,0.1)]"
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
            className="p-1 border-0 rounded-sm cursor-pointer bg-transparent transition-colors duration-200 flex items-center justify-center hover:bg-[rgba(24,144,255,0.1)]"
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
                className="p-1 border-0 rounded-sm cursor-pointer bg-transparent transition-colors duration-200 flex items-center justify-center hover:bg-[rgba(82,196,26,0.1)]"
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

      <div className="flex justify-between items-start gap-4 mt-2 max-md:flex-col">
        {/* Destination Information */}
        <div className="mb-2 text-[#333]">
          <div className="flex items-center gap-1.5 mb-1 text-sm">
            <CalendarMonthIcon fontSize="small" />
            <span className="font-medium text-[#555] min-w-13.75">Date:</span>
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1.5 mb-1 text-sm">
            <AccessTimeIcon fontSize="small" />
            <span className="font-medium text-[#555] min-w-13.75">Time:</span>
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-1.5 mb-1 text-sm">
            <LocationOnIcon fontSize="small" />
            <span className="font-medium text-[#555] min-w-13.75">Pick-up:</span>
            <span>{ride.startLocation.name}</span>
          </div>
          <div className="flex items-center gap-1.5 mb-1 text-sm">
            <LocationOnIcon fontSize="small" />
            <span className="font-medium text-[#555] min-w-13.75">Drop-off:</span>
            <span>{ride.endLocation.name}</span>
          </div>
        </div>

        {/* Driver Information or Scheduling Status */}
        <div className="mb-2 text-[#333]">
          {ride.driver ? (
            <div className="flex gap-3 items-start">
              <div className="w-15 h-15 shrink-0">
                {getDriverImageSrc() ? (
                  <img
                    src={getDriverImageSrc()!}
                    alt={`${ride.driver.firstName} ${ride.driver.lastName}`}
                    className="w-full h-full object-cover rounded-full"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full bg-[#f0f0f0] rounded-full flex items-center justify-center text-[#999]">
                    <PersonIcon fontSize="large" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 mb-1 text-sm">
                  <PersonIcon fontSize="small" />
                  <span className="font-medium text-[#555] min-w-13.75">Name:</span>
                  <span>
                    {ride.driver.firstName} {ride.driver.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mb-1 text-sm">
                  <PhoneIcon fontSize="small" />
                  <span className="font-medium text-[#555] min-w-13.75">Phone:</span>
                  <span>{ride.driver.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-1 text-sm">
                  <EmailIcon fontSize="small" />
                  <span className="font-medium text-[#555] min-w-13.75">Email:</span>
                  <span>{ride.driver.email}</span>
                </div>
                <div className="py-1 px-2 bg-[#f0f0f0] rounded capitalize text-sm ml-2">
                  Status: {ride.status.replace('_', ' ')}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 items-start">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 mb-1 text-sm">
                  <PersonIcon fontSize="small" />
                  <span className="font-medium text-[#555] min-w-13.75">Scheduling:</span>
                  <span>Unscheduled</span>
                </div>
                <div className="py-1 px-2 bg-[#f0f0f0] rounded capitalize text-sm ml-2">
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
