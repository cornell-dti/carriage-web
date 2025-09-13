import React from 'react';
import { Card, CardContent, Typography, Avatar, Box } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Rider, Employee } from '../../types/index';

interface UserInfoCardProps {
  user: Employee | Rider;
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
    <Card className="bg-white rounded-xl border border-gray-600 shadow-xl p-4 flex flex-col h-full">
      <CardContent className="flex-1 flex flex-col p-0">
        <h3 className="text-md font-medium text-gray-900 mb-3">User Info</h3>
        
        {/* Basic Info */}
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Basic Info</h4>
          <div className="flex items-center gap-3">
            <Avatar
              src={user.photoLink ? `${user.photoLink}?t=${new Date().getTime()}` : undefined}
              className="w-12 h-12 border-2 border-gray-200"
              alt={`${user.firstName} ${user.lastName}`}
            >
              <PersonIcon fontSize="large" />
            </Avatar>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
              <span className="text-gray-400">•</span>
              <p className="text-xs text-gray-600">{(user as any).netId || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex-grow">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Info</h4>
          <div className="space-y-1">
            {userType === 'employee' ? (
              <>
                <div className="flex items-center gap-2">
                  <WorkIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <p className="text-xs font-medium text-gray-900">{getEmployeeRole(user as Employee)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <p className="text-xs font-medium text-gray-900">{user.phoneNumber || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <EmailIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <p className="text-xs font-medium text-gray-900 truncate">{(user as Employee).email || 'N/A'}</p>
                </div>
                {(user as Employee).availability && (
                  <div className="flex items-center gap-2">
                    <CalendarTodayIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <p className="text-xs font-medium text-gray-900">{formatAvailability((user as Employee).availability)}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <p className="text-xs font-medium text-gray-900">{user.phoneNumber || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <HomeIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <p className="text-xs font-medium text-gray-900">{(user as Rider).address || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarTodayIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <p className="text-xs font-medium text-gray-900">{formatDateRange((user as Rider).joinDate, (user as Rider).endDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {(user as Rider).active ? 
                    <CheckCircleIcon className="w-3 h-3 text-green-500 flex-shrink-0" /> : 
                    <CancelIcon className="w-3 h-3 text-red-500 flex-shrink-0" />
                  }
                  <p className={`text-xs font-medium ${(user as Rider).active ? 'text-green-700' : 'text-red-700'}`}>
                    {(user as Rider).active ? 'Active' : 'Inactive'}
                  </p>
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