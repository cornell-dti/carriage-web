import React from 'react';
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Button,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';
import { Status, SchedulingState } from '@carriage-web/shared/types/ride';
import { StatisticsFilters } from './hooks/useUserStatistics';

interface StatisticsFilterProps {
  filters: StatisticsFilters;
  onFiltersChange: (filters: StatisticsFilters) => void;
  onClose: () => void;
}

const StatisticsFilter: React.FC<StatisticsFilterProps> = ({
  filters,
  onFiltersChange,
  onClose,
}) => {
  const statusOptions = [
    { value: Status.COMPLETED, label: 'Completed' },
    { value: Status.CANCELLED, label: 'Cancelled' },
    { value: Status.NO_SHOW, label: 'No Show' },
    { value: Status.NOT_STARTED, label: 'Not Started' },
    { value: Status.ON_THE_WAY, label: 'On the Way' },
    { value: Status.ARRIVED, label: 'Arrived' },
    { value: Status.PICKED_UP, label: 'Picked Up' },
  ];

  const schedulingStateOptions = [
    { value: SchedulingState.SCHEDULED, label: 'Scheduled' },
    { value: SchedulingState.UNSCHEDULED, label: 'Unscheduled' },
  ];

  const rideTypeOptions = [
    { value: 'regular', label: 'Regular' },
    { value: 'recurring', label: 'Recurring' },
    { value: 'special', label: 'Special' },
  ];

  const handleStatusChange = (statuses: Status[]) => {
    onFiltersChange({ ...filters, statuses });
  };

  const handleSchedulingStateChange = (schedulingStates: SchedulingState[]) => {
    onFiltersChange({ ...filters, schedulingStates });
  };

  const handleTypeChange = (types: string[]) => {
    onFiltersChange({ ...filters, types });
  };

  const handleDateFromChange = (date: Date | null) => {
    onFiltersChange({ ...filters, dateFrom: date });
  };

  const handleDateToChange = (date: Date | null) => {
    onFiltersChange({ ...filters, dateTo: date });
  };

  const clearFilters = () => {
    onFiltersChange({
      dateFrom: null,
      dateTo: null,
      statuses: [],
      schedulingStates: [],
      types: [],
    });
  };

  return (
    <Paper sx={{ p: 3, minWidth: 300, maxWidth: 400 }} elevation={3}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6">Filter Statistics</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Date Filters */}
          <DatePicker
            label="From Date"
            value={filters.dateFrom}
            onChange={handleDateFromChange}
            slotProps={{ textField: { size: 'small' } }}
          />

          <DatePicker
            label="To Date"
            value={filters.dateTo}
            onChange={handleDateToChange}
            slotProps={{ textField: { size: 'small' } }}
          />

          {/* Status Filter */}
          <FormControl size="small">
            <InputLabel>Status</InputLabel>
            <Select
              multiple
              value={filters.statuses}
              onChange={(e) => handleStatusChange(e.target.value as Status[])}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={
                        statusOptions.find((s) => s.value === value)?.label
                      }
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Scheduling State Filter */}
          <FormControl size="small">
            <InputLabel>Scheduling State</InputLabel>
            <Select
              multiple
              value={filters.schedulingStates}
              onChange={(e) =>
                handleSchedulingStateChange(e.target.value as SchedulingState[])
              }
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={
                        schedulingStateOptions.find((s) => s.value === value)
                          ?.label
                      }
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {schedulingStateOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Type Filter */}
          <FormControl size="small">
            <InputLabel>Ride Type</InputLabel>
            <Select
              multiple
              value={filters.types}
              onChange={(e) => handleTypeChange(e.target.value as string[])}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={
                        rideTypeOptions.find((t) => t.value === value)?.label
                      }
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {rideTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button variant="outlined" onClick={clearFilters} size="small">
              Clear Filters
            </Button>
            <Button variant="contained" onClick={onClose} size="small">
              Apply
            </Button>
          </Box>
        </Box>
      </LocalizationProvider>
    </Paper>
  );
};

export default StatisticsFilter;
