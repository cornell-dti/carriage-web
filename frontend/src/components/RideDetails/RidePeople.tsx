import React from 'react';
import {
  Box,
  Typography,
  CardContent,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { RideType, Driver, Rider } from '../../types';
import styles from './RidePeople.module.css';

interface RidePeopleProps {
  ride: RideType;
  userRole: 'rider' | 'driver' | 'admin';
}

interface PersonCardProps {
  person: Driver | Rider;
  type: 'driver' | 'rider';
  showAccessibility?: boolean;
}

const PersonCard: React.FC<PersonCardProps> = ({ person, type, showAccessibility = false }) => {
  const isRider = type === 'rider';
  const rider = isRider ? person as Rider : undefined;

  return (
    <div className={styles.personCard}>
      <CardContent>
        <div className={styles.personHeader}>
          <Avatar
            src={person.photoLink}
            sx={{ width: 48, height: 48 }}
          >
            {person.firstName?.charAt(0)}{person.lastName?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {person.firstName} {person.lastName}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
              {type}
            </Typography>
            {rider?.pronouns && (
              <Typography variant="body2" color="textSecondary">
                {rider.pronouns}
              </Typography>
            )}
          </Box>
        </div>

        {/* Contact Information */}
        <div className={styles.contactInfo}>
          {person.phoneNumber && (
            <div className={styles.contactRow}>
              <IconButton size="small" aria-label="Call">
                <PhoneIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2">
                {person.phoneNumber}
              </Typography>
            </div>
          )}
          {person.email && (
            <div className={styles.contactRow}>
              <IconButton size="small" aria-label="Email">
                <EmailIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2">
                {person.email}
              </Typography>
            </div>
          )}
        </div>

        {/* Accessibility needs for riders */}
        {showAccessibility && rider?.accessibility && rider.accessibility.length > 0 && (
          <div className={styles.accessibilitySection}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Accessibility Needs
            </Typography>
            <div className={styles.accessibilityChips}>
              {rider.accessibility.map((need: string) => (
                <Chip
                  key={need}
                  label={need}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
};

const RidePeople: React.FC<RidePeopleProps> = ({ ride, userRole }) => {
  const renderRiderView = () => (
    <div className={styles.container}>
      <Typography variant="h6" gutterBottom>
        Driver Information
      </Typography>
      {ride.driver ? (
        <PersonCard person={ride.driver} type="driver" />
      ) : (
        <div className={styles.notAssigned}>
          <Typography variant="body1">
            Not assigned
          </Typography>
        </div>
      )}
    </div>
  );

  const renderDriverView = () => (
    <div className={styles.container}>
      <Typography variant="h6" gutterBottom>
        Rider Information
      </Typography>
      <PersonCard person={ride.rider} type="rider" showAccessibility />
    </div>
  );

  const renderAdminView = () => (
    <div className={styles.container}>
      <div className={styles.adminContainer}>
        <div className={styles.adminCard}>
          <Typography variant="subtitle1" gutterBottom>
            Rider
          </Typography>
          <PersonCard person={ride.rider} type="rider" showAccessibility />
        </div>
        <div className={styles.adminCard}>
          <Typography variant="subtitle1" gutterBottom>
            Driver
          </Typography>
          {ride.driver ? (
            <PersonCard person={ride.driver} type="driver" />
          ) : (
            <div className={styles.notAssigned}>
              <Typography variant="body1">
                Not assigned
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  switch (userRole) {
    case 'rider':
      return renderRiderView();
    case 'driver':
      return renderDriverView();
    case 'admin':
      return renderAdminView();
    default:
      return renderRiderView();
  }
};

export default RidePeople;