import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Popover,
  Box,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import useUserStatistics, { StatisticsFilters } from './hooks/useUserStatistics';
import StatisticsFilter from './StatisticsFilter';
import { Rider, Employee, Ride } from '../../types/index';

interface StatisticsCardProps {
  user: Employee | Rider;
  userType: 'employee' | 'rider';
  rides: Ride[];
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ user, userType, rides }) => {
  const [filters, setFilters] = useState<StatisticsFilters>({
    dateFrom: null,
    dateTo: null,
    statuses: [],
    schedulingStates: [],
    types: []
  });
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const statistics = useUserStatistics(rides, filters);
  const filterOpen = Boolean(anchorEl);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card className="bg-white rounded-xl border border-gray-200 shadow-xl p-4 flex flex-col h-full">
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-medium text-gray-900">Statistics</h3>
          <IconButton 
            onClick={handleFilterClick} 
            size="small" 
            aria-label="filter statistics"
            className="flex items-center justify-center w-6 h-6 bg-white rounded hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <FilterListIcon className="w-3 h-3 text-gray-600" />
          </IconButton>
        </div>

        <Popover
          open={filterOpen}
          anchorEl={anchorEl}
          onClose={handleFilterClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <StatisticsFilter
            filters={filters}
            onFiltersChange={setFilters}
            onClose={handleFilterClose}
          />
        </Popover>

        <div className="flex-grow">
          {/* Top row - 3 statistics */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="bg-blue-50 p-2 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-600">{statistics.completed}</div>
              <div className="text-xs text-blue-600">Completed</div>
            </div>
            
            <div className="bg-red-50 p-2 rounded-lg text-center">
              <div className="text-lg font-bold text-red-600">{statistics.cancelled}</div>
              <div className="text-xs text-red-600">Cancelled</div>
            </div>
            
            <div className="bg-yellow-50 p-2 rounded-lg text-center">
              <div className="text-lg font-bold text-yellow-600">{statistics.noShows}</div>
              <div className="text-xs text-yellow-600">No Show</div>
            </div>
          </div>
          
          {/* Bottom row - Total */}
          <div className="bg-gray-100 p-2 rounded-lg text-center">
            <div className="text-lg font-bold text-gray-600">{statistics.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsCard;