import React from 'react';
import { Avatar, Box, Typography, Card, CardContent } from '@mui/material';
import cn from 'classnames';
import { RiderType } from '@carriage-web/shared/types/rider';
import { DriverType } from '@carriage-web/shared/types/driver';
import { user as defaultUserIcon } from '../../../icons/userInfo/index';

type otherInfo = {
  children: JSX.Element | JSX.Element[];
};

export const OtherInfo = ({ children }: otherInfo) => (
  <div otherInfoContainer}>{children}</div>
);

type UserContactInfo = {
  icon: string;
  alt: string;
  text: string;
};

export const UserContactInfo = ({ icon, alt, text }: UserContactInfo) => (
  <div contactInfo}>
    <img contactIcon} src={icon} alt={alt} />
    <p contactText}>{text}</p>
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
  rider?: RiderType;
  driver?: DriverType;
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
      className={cn(userDetail, { 'isRider })}
      elevation={2}
    >
      <CardContent userDetailContent}>
        <Box profileSection}>
          <Box profilePicContainer}>
            <Avatar
              src={
                photoLink && photoLink !== ''
                  ? `${photoLink}?t=${new Date().getTime()}`
                  : undefined
              }
              profilePic}
              alt={`${fullName} profile`}
            >
              {(!photoLink || photoLink === '') && (
                <img
                  src={defaultUserIcon}
                  alt="Default user"
                  defaultUserIcon}
                />
              )}
            </Avatar>
          </Box>
        </Box>

        <Box basicInfoContainer}>
          <Box basicInfoTop}>
            <Box nameInfoContainer}>
              <Typography variant="h4" name}>
                {fullName}
              </Typography>
              <Typography variant="body2" netId}>
                {netId}
              </Typography>
            </Box>
          </Box>

          <Box contactInfoContainer}>{children}</Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserDetail;
