import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Typography, Box, Grid, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { RideTable } from '../RideDetails';
import UserInfoCard from './UserInfoCard';
import StatisticsCard from './StatisticsCard';
import ActionsCard from './ActionsCard';
import useUserDetailData from './hooks/useUserDetailData';

interface UserDetailPageProps {
  userType: 'employee' | 'rider';
}

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen text-center">
    <CircularProgress />
  </div>
);

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <div className="flex items-center justify-center min-h-96 text-center">
    <Typography variant="h6" className="text-red-600 text-lg">
      Error: {error}
    </Typography>
  </div>
);

const NotFound: React.FC = () => (
  <div className="flex items-center justify-center min-h-96 text-center">
    <Typography variant="h6">
      User not found
    </Typography>
  </div>
);

const UserDetailPage: React.FC<UserDetailPageProps> = ({ userType }) => {
  const { id: userId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { user, rides, loading, error } = useUserDetailData(userId, userType);
  
  const handleBack = () => {
    const backPath = userType === 'employee' ? '/admin/employees' : '/admin/riders';
    navigate(backPath);
  };

  React.useEffect(() => {
    if (user) {
      document.title = `${user.firstName} ${user.lastName} - Carriage`;
    } else {
      const titlePrefix = userType === 'employee' ? 'Employee' : 'Rider';
      document.title = `${titlePrefix} Details - Carriage`;
    }
  }, [user, userType]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <NotFound />;

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <IconButton 
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowBackIcon className="w-5 h-5 text-gray-600" />
          </IconButton>
          <Typography 
            variant="h6" 
            component="h1" 
            className="text-2xl font-bold text-gray-900"
          >
            {userType === 'employee' ? 'Employees' : 'Students'}
          </Typography>
        </div>
      </div>

      <div className="space-y-6">
        {/* User Section */}
        <div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              <UserInfoCard user={user} userType={userType} />
              <StatisticsCard user={user} userType={userType} rides={rides} />
              <ActionsCard user={user} userType={userType} />
            </div>
          </div>
        </div>

        {/* Rides Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4">
            <RideTable rides={rides} userRole="admin" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;