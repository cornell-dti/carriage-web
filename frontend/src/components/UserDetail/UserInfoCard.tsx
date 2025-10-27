import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Employee } from '../../types/index';
import { RiderType } from '@carriage-web/shared/types/rider';
import { getUserNetId } from '../../util';
import styles from './UserDetailCards.module.css';

interface UserInfoCardProps {
  user: Employee | RiderType;
  userType: 'employee' | 'rider';
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ user, userType }) => {
  const getEmployeeRole = (employee: Employee) => {
    if (!employee.type || employee.type.length === 0) return 'N/A';
    return employee.type.join(', ');
  };

  const formatAvailability = (availability: string[] | undefined) => {
    if (!availability || availability.length === 0) return 'N/A';
    return availability.join(' • ');
  };

  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate) return 'N/A';
    const start = new Date(startDate).toLocaleDateString();
    if (!endDate) return `${start} - Present`;
    const end = new Date(endDate).toLocaleDateString();
    return `${start} - ${end}`;
  };

  return (
    <Card className={styles.userDetailCard}>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-medium text-gray-900">User Info</h3>
          {userType === 'rider' ? (
            <Chip
              icon={
                (user as RiderType).active ? (
                  <CheckCircleIcon />
                ) : (
                  <CancelIcon />
                )
              }
              label={(user as RiderType).active ? 'Active' : 'Inactive'}
              size="small"
              color={(user as RiderType).active ? 'success' : 'error'}
              variant="outlined"
              className="text-xs"
            />
          ) : (
            <Chip
              label={getEmployeeRole(user as Employee)}
              size="small"
              variant="outlined"
              className="text-xs bg-blue-50 border-blue-300 text-blue-700"
            />
          )}
        </div>

        {/* Basic Info */}
        <div className="mb-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={
                user.photoLink
                  ? `${user.photoLink}?t=${new Date().getTime()}`
                  : undefined
              }
              className="w-12 h-12 border-2 border-gray-200"
              alt={`${user.firstName} ${user.lastName}`}
            >
              <PersonIcon fontSize="large" />
            </Avatar>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              {getUserNetId(user) && (
                <Chip
                  label={getUserNetId(user)}
                  size="small"
                  variant="outlined"
                  className="text-xs bg-gray-50 border-gray-300"
                />
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex-grow">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Contact Info
          </h4>
          <div className="space-y-2">
            {userType === 'employee' ? (
              <>
                {/* First row: Phone, Email */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <PhoneIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-900">
                      {user.phoneNumber || 'N/A'}
                    </span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <EmailIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-900 truncate">
                      {(user as Employee).email || 'N/A'}
                    </span>
                  </div>
                </div>
                {/* Second row: Working days */}
                {(user as Employee).availability && (
                  <div className="flex items-center gap-2 text-xs">
                    <CalendarTodayIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-900">
                      {formatAvailability((user as Employee).availability)}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* First row: Email, Phone */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <EmailIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-900 truncate">
                      {(user as RiderType).email || 'N/A'}
                    </span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <PhoneIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-900">
                      {user.phoneNumber || 'N/A'}
                    </span>
                  </div>
                </div>
                {/* Second row: Address */}
                <div className="flex items-center gap-2 text-xs">
                  <HomeIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-900">
                    {(user as RiderType).address || 'N/A'}
                  </span>
                </div>
                {/* Third row: Active dates */}
                <div className="flex items-center gap-2 text-xs">
                  <CalendarTodayIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-900">
                    {formatDateRange(
                      (user as RiderType).joinDate,
                      (user as RiderType).endDate
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfoCard;
