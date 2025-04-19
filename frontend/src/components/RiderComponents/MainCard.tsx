import React, { useState } from 'react';
import {
  format,
  isBefore,
  set,
  setHours,
  setMinutes,
  setSeconds,
  subDays,
} from 'date-fns';
import { Driver, Ride } from 'types';
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
import { formatDate } from 'react-datepicker/dist/date_utils';
import RequestRideModal from 'components/RequestRideModal/RequestRideModal';
import RequestRideDialog from './RequestRideDialog';
import { useLocations } from 'context/LocationsContext';
import DriverInfoDialog from './DriverInfoDialog';

// Dummy driver data if none is provided
const dummyDriver: Driver = {
  id: 'driver_1',
  firstName: 'Matthias',
  lastName: 'Choi',
  phoneNumber: '5551234567',
  email: 'mt123@cornell.edu',
  photoLink: '/driver.jpg',
  startDate: '2024-01-01',
  availability: {
    Mon: { startTime: '09:00', endTime: '17:00' },
    Wed: { startTime: '09:00', endTime: '17:00' },
    Fri: { startTime: '09:00', endTime: '17:00' },
  },
};

interface MainCardProps {
  ride: Ride;
  driver?: Driver;
}

const MainCard: React.FC<MainCardProps> = ({ ride, driver = dummyDriver }) => {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [openDeleteOrEditModal, setOpenDeleteOrEditModal] = useState(false); // only using delete functionality
  const [editOpen, setEditOpen] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false); // different ride modal for editing
  const [contactOpen, setContactOpen] = useState(false);
  const [openDriverInfoDialog, setOpenDriverInfoDialog] = useState(false);
  // const locations = useLocations();
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, 'yyyy-MM-dd'),
      time: format(date, 'h:mm a'),
    };
  };

  const { date, time } = formatDateTime(ride.startTime);

  const handleCancel = () => {
    // console.log(date, time);
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
    setEditOpen(!editOpen);
  };

  const handleContact = () => {
    setContactOpen(!contactOpen);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>Next Ride</h2>
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
            // figure out how to handle so that the modal doesn't close on just any click
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
            // dummy data, remove after db connect
            supportedLocations={[
              {
                id: 1,
                name: 'Campus Center',
                address: '123 Campus Drive',
                info: 'Main campus center',
                tag: 'Central',
                lat: 42.4534531,
                lng: -76.4760776,
              },
              {
                id: 2,
                name: 'North Campus',
                address: '456 North Drive',
                info: 'North campus area',
                tag: 'North',
                lat: 42.4534531,
                lng: -76.4760776,
              },
              {
                id: 3,
                name: 'West Campus',
                address: '789 West Drive',
                info: 'West campus area',
                tag: 'West',
                lat: 42.4534531,
                lng: -76.4760776,
              },
              // Add more locations as needed
            ]}
          />
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
            driverInfo={driver}
          />
        </div>
      </div>

      <div className={styles.contentRow}>
        {/* Destination Information */}
        <div className={styles.section}>
          {/* <h3>Destination Information</h3> */}
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

        {/* Driver Information */}
        <div className={styles.section}>
          {/* <h3>Driver Information</h3> */}
          <div className={styles.driverInfo}>
            <div className={styles.driverImageContainer}>
              <img
                src={driver.photoLink}
                alt={`${driver.firstName} ${driver.lastName}`}
                className={styles.driverImage}
              />
            </div>
            <div className={styles.driverDetails}>
              <div className={styles.detail}>
                <PersonIcon fontSize="small" />
                <span className={styles.label}>Name:</span>
                <span>
                  {driver.firstName} {driver.lastName}
                </span>
              </div>
              <div className={styles.detail}>
                <PhoneIcon fontSize="small" />
                <span className={styles.label}>Phone:</span>
                <span>{driver.phoneNumber}</span>
              </div>
              <div className={styles.detail}>
                <EmailIcon fontSize="small" />
                <span className={styles.label}>Email:</span>
                <span>{driver.email}</span>
              </div>
              <div className={styles.status}>
                Status: {ride.status.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainCard;
