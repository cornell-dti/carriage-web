import React from 'react';
import { format } from 'date-fns';
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
  onCancel?: () => void;
  onEdit?: () => void;
  onContact?: () => void;
}

const MainCard: React.FC<MainCardProps> = ({
  ride,
  driver = dummyDriver,
  onCancel,
  onEdit,
  onContact,
}) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, 'yyyy-MM-dd'),
      time: format(date, 'h:mm a'),
    };
  };

  const { date, time } = formatDateTime(ride.startTime);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>Next Ride</h2>
        <div className={styles.actions}>
          <button
            onClick={onCancel}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            <CancelIcon fontSize="small" />
          </button>
          <button
            onClick={onEdit}
            className={`${styles.button} ${styles.editButton}`}
          >
            <EditIcon fontSize="small" />
          </button>
          <button
            onClick={onContact}
            className={`${styles.button} ${styles.contactButton}`}
          >
            <CallIcon fontSize="small" />
          </button>
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
