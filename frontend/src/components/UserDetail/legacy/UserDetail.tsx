import React from 'react';
import { Avatar, Box, Typography, Card, CardContent } from '@mui/material';
import cn from 'classnames';
import { Rider, DriverType as Driver } from '../../../types/index';
import { user as defaultUserIcon } from '../../../icons/userInfo/index';
import styles from './userDetail.module.css';

type otherInfo = {
  children: JSX.Element | JSX.Element[];
};

export const OtherInfo = ({ children }: otherInfo) => (
  <div className={styles.otherInfoContainer}>{children}</div>
);

type UserContactInfo = {
  icon: string;
  alt: string;
  text: string;
};

export const UserContactInfo = ({ icon, alt, text }: UserContactInfo) => (
  <div className={styles.contactInfo}>
    <img className={styles.contactIcon} src={icon} alt={alt} />
    <p className={styles.contactText}>{text}</p>
  </div>
);

type EmployeeDetailProps = {
  id: string;
  firstName: string;
  lastName: string;
  type?: string[];
  isDriver?: boolean;
  netId: string;
  phoneNumber: string;
  availability?: string[];
  photoLink?: string;
  startDate?: string;
};

type UserDetailProps = {
  firstName: string;
  lastName: string;
  netId: string;
  children: React.ReactNode;
  employee?: EmployeeDetailProps;
  role?: string;
  photoLink?: string;
  isRider?: boolean;
  rider?: Rider;
  driver?: Driver;
};

const UserDetail = ({
  firstName,
  lastName,
  netId,
  children,
  employee,
  role,
  photoLink,
  isRider,
  rider,
  driver,
}: UserDetailProps) => {
  const fullName = `${firstName} ${lastName}`;

  return (
    <Card
      className={cn(styles.userDetail, { [styles.rider]: isRider })}
      elevation={2}
    >
      <CardContent className={styles.userDetailContent}>
        <Box className={styles.profileSection}>
          <Box className={styles.profilePicContainer}>
            <Avatar
              src={
                photoLink && photoLink !== ''
                  ? `${photoLink}?t=${new Date().getTime()}`
                  : undefined
              }
              className={styles.profilePic}
              alt={`${fullName} profile`}
            >
              {(!photoLink || photoLink === '') && (
                <img
                  src={defaultUserIcon}
                  alt="Default user"
                  className={styles.defaultUserIcon}
                />
              )}
            </Avatar>
          </Box>
        </Box>

        <Box className={styles.basicInfoContainer}>
          <Box className={styles.basicInfoTop}>
            <Box className={styles.nameInfoContainer}>
              <Typography variant="h4" className={styles.name}>
                {fullName}
              </Typography>
              <Typography variant="body2" className={styles.netId}>
                {netId}
              </Typography>
            </Box>
          </Box>

          <Box className={styles.contactInfoContainer}>{children}</Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserDetail;
