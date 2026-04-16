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
  <div className="[border-top-style:ridge] pt-[3%] mt-[3%]">{children}</div>
);

type UserContactInfo = {
  icon: string;
  alt: string;
  text: string;
};

export const UserContactInfo = ({ icon, alt, text }: UserContactInfo) => (
  <div className="flex flex-row items-center gap-4 py-2">
    <img className="w-5 h-5 opacity-70 shrink-0" src={icon} alt={alt} />
    <p className="text-base text-[#374151] font-medium leading-snug">{text}</p>
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
      className={cn('rounded-xl bg-white mb-6', { 'mx-10': isRider })}
      elevation={2}
    >
      <CardContent className="flex flex-row p-6 gap-6 min-h-fit max-md:flex-col max-md:p-6 max-md:gap-6">
        <Box className="flex items-center justify-center shrink-0 max-md:items-center max-md:justify-center">
          <Box className="flex items-center justify-center h-full">
            <Avatar
              src={
                photoLink && photoLink !== ''
                  ? `${photoLink}?t=${new Date().getTime()}`
                  : undefined
              }
              className="w-32 h-32 border-3 border-[#f0f0f0] shadow-[0_4px_12px_rgba(0,0,0,0.1)] max-md:w-24 max-md:h-24"
              alt={`${fullName} profile`}
            >
              {(!photoLink || photoLink === '') && (
                <img
                  src={defaultUserIcon}
                  alt="Default user"
                  className="w-12 h-12 opacity-60 grayscale max-md:w-10 max-md:h-10"
                />
              )}
            </Avatar>
          </Box>
        </Box>

        <Box className="flex-1 min-w-0 flex flex-col gap-6 max-md:text-center">
          <Box className="flex flex-col gap-2">
            <Box className="flex flex-col gap-1">
              <Typography
                variant="h4"
                className="text-[1.75rem] font-bold text-[#1a1a1a] m-0 leading-tight max-md:text-2xl"
              >
                {fullName}
              </Typography>
              <Typography
                variant="body2"
                className="text-base text-[#6b7280] m-0 font-medium"
              >
                {netId}
              </Typography>
            </Box>
          </Box>

          <Box className="flex flex-col gap-4 bg-[#f8f9fa] p-6 rounded-lg border border-[#e9ecef] max-md:p-4">
            {children}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserDetail;
