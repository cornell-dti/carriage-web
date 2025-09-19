import React, { useState, useMemo, useContext } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
  Chip,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Stack,
  IconButton,
  Collapse,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { visuallyHidden } from '@mui/utils';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { RideType, Status, SchedulingState } from '../../types';
import AuthContext from '../../context/auth';
import RideDetailsComponent from './RideDetailsComponent';

interface RideTableProps {
  rides: RideType[];
  loading?: boolean;
  error?: string;
  userRole?: 'rider' | 'driver' | 'admin';
}

interface FilterState {
  dateFrom: Date | null;
  dateTo: Date | null;
  statuses: Status[];
  schedulingStates: SchedulingState[];
  temporalTypes: string[];
  searchText: string;
}

type Order = 'asc' | 'desc';
type SortField =
  | 'date'
  | 'startTime'
  | 'endTime'
  | 'status'
  | 'rider'
  | 'driver';

// Helper function to determine temporal type
const getTemporalType = (ride: RideType): 'Past' | 'Active' | 'Upcoming' => {
  const now = new Date().getTime();
  const startTime = new Date(ride.startTime).getTime();
  const endTime = new Date(ride.endTime).getTime();

  if (endTime < now) return 'Past';
  if (startTime <= now && now < endTime) return 'Active';
  return 'Upcoming';
};

// Material-UI style comparator functions
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Custom comparator for ride data
function getRideComparator(order: Order, orderBy: SortField) {
  return order === 'desc'
    ? (a: RideType, b: RideType) => descendingRideComparator(a, b, orderBy)
    : (a: RideType, b: RideType) => -descendingRideComparator(a, b, orderBy);
}

function descendingRideComparator(
  a: RideType,
  b: RideType,
  orderBy: SortField
) {
  let aValue: any;
  let bValue: any;

  switch (orderBy) {
    case 'date':
    case 'startTime':
      aValue = new Date(a.startTime).getTime();
      bValue = new Date(b.startTime).getTime();
      break;
    case 'endTime':
      aValue = new Date(a.endTime).getTime();
      bValue = new Date(b.endTime).getTime();
      break;
    case 'status':
      aValue = a.status;
      bValue = b.status;
      break;
    case 'rider':
      // For sorting, use primary rider (first in array) or empty string
      aValue =
        a.riders && a.riders.length > 0
          ? `${a.riders[0].firstName} ${a.riders[0].lastName}`
          : '';
      bValue =
        b.riders && b.riders.length > 0
          ? `${b.riders[0].firstName} ${b.riders[0].lastName}`
          : '';
      break;
    case 'driver':
      aValue = a.driver ? `${a.driver.firstName} ${a.driver.lastName}` : '';
      bValue = b.driver ? `${b.driver.firstName} ${b.driver.lastName}` : '';
      break;
    default:
      return 0;
  }

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

const getStatusColor = (
  status: Status
): 'default' | 'primary' | 'info' | 'warning' | 'success' | 'error' => {
  switch (status) {
    case Status.NOT_STARTED:
      return 'default';
    case Status.ON_THE_WAY:
      return 'primary';
    case Status.ARRIVED:
      return 'info';
    case Status.PICKED_UP:
      return 'warning';
    case Status.COMPLETED:
      return 'success';
    case Status.NO_SHOW:
    case Status.CANCELLED:
      return 'error';
    default:
      return 'default';
  }
};

const getSchedulingStateColor = (
  state: SchedulingState
): 'default' | 'success' | 'warning' => {
  switch (state) {
    case SchedulingState.SCHEDULED:
      return 'success';
    case SchedulingState.UNSCHEDULED:
      return 'warning';
    default:
      return 'default';
  }
};

const getTemporalTypeColor = (
  type: string
): 'default' | 'info' | 'warning' | 'success' => {
  switch (type) {
    case 'Past':
      return 'default';
    case 'Active':
      return 'warning';
    case 'Upcoming':
      return 'info';
    default:
      return 'default';
  }
};

const RideTable: React.FC<RideTableProps> = ({
  rides,
  loading = false,
  error,
  userRole: propUserRole,
}) => {
  const authContext = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<SortField>('startTime');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedRide, setSelectedRide] = useState<RideType | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    dateFrom: null,
    dateTo: null,
    statuses: [],
    schedulingStates: [],
    temporalTypes: [],
    searchText: '',
  });

  // Determine user role and appropriate columns
  const getUserRole = (): 'rider' | 'driver' | 'admin' => {
    // If role is explicitly passed as prop, use that
    if (propUserRole) return propUserRole;

    // Otherwise use localStorage userType as source of truth
    const userType = localStorage.getItem('userType');
    if (userType === 'Admin') return 'admin';
    if (userType === 'Driver') return 'driver';
    if (userType === 'Rider') return 'rider';

    // Fallback
    return 'rider';
  };

  const userRole = getUserRole();

  // Define columns based on role
  const getColumnsForRole = () => {
    const baseColumns = [
      { key: 'date', label: 'Date', sortable: true },
      { key: 'startTime', label: 'Start Time', sortable: true },
      { key: 'endTime', label: 'End Time', sortable: true },
      { key: 'from', label: 'From', sortable: false },
      { key: 'to', label: 'To', sortable: false },
      { key: 'status', label: 'Status', sortable: true },
    ];

    switch (userRole) {
      case 'rider':
        return [
          ...baseColumns,
          {
            key: 'schedulingState',
            label: 'Scheduling State',
            sortable: false,
          },
          { key: 'type', label: 'Type', sortable: false },
        ];
      case 'driver':
        return [
          ...baseColumns,
          { key: 'type', label: 'Type', sortable: false },
        ];
      case 'admin':
        return [
          ...baseColumns,
          {
            key: 'schedulingState',
            label: 'Scheduling State',
            sortable: false,
          },
          { key: 'type', label: 'Type', sortable: false },
        ];
      default:
        return baseColumns;
    }
  };

  const columns = getColumnsForRole();

  // Filter rides (sorting will be applied after)
  const filteredRides = useMemo(() => {
    let filtered = rides;

    // For drivers, only show scheduled rides
    if (userRole === 'driver') {
      filtered = filtered.filter(
        (ride) => ride.schedulingState === SchedulingState.SCHEDULED
      );
    }

    // Apply filters
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (ride) => new Date(ride.startTime) >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      const endOfDay = new Date(filters.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (ride) => new Date(ride.startTime) <= endOfDay
      );
    }

    if (filters.statuses.length > 0) {
      filtered = filtered.filter((ride) =>
        filters.statuses.includes(ride.status)
      );
    }

    if (filters.schedulingStates.length > 0) {
      filtered = filtered.filter((ride) =>
        filters.schedulingStates.includes(ride.schedulingState)
      );
    }

    if (filters.temporalTypes.length > 0) {
      filtered = filtered.filter((ride) =>
        filters.temporalTypes.includes(getTemporalType(ride))
      );
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (ride) =>
          // Search across all riders in the array
          ride.riders?.some(
            (rider) =>
              rider.firstName?.toLowerCase().includes(searchLower) ||
              rider.lastName?.toLowerCase().includes(searchLower)
          ) ||
          ride.driver?.firstName?.toLowerCase().includes(searchLower) ||
          ride.driver?.lastName?.toLowerCase().includes(searchLower) ||
          ride.startLocation.name?.toLowerCase().includes(searchLower) ||
          ride.endLocation.name?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [rides, filters, userRole]);

  // Apply sorting using Material-UI approach
  const sortedRides = useMemo(() => {
    return [...filteredRides].sort(getRideComparator(order, orderBy));
  }, [filteredRides, order, orderBy]);

  // Pagination with Material-UI
  const paginatedRides = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedRides.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedRides, page, rowsPerPage]);

  // Material-UI style sort handler
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: SortField
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRowClick = (ride: RideType) => {
    setSelectedRide(ride);
    setDetailsOpen(true);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: null,
      dateTo: null,
      statuses: [],
      schedulingStates: [],
      temporalTypes: [],
      searchText: '',
    });
    setPage(0);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Create sort handler for individual columns
  const createSortHandler =
    (property: SortField) => (event: React.MouseEvent<unknown>) => {
      handleRequestSort(event, property);
    };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>Loading rides...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Rides</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {!isMobile && (
              <Typography variant="body2" color="text.secondary">
                Filter
              </Typography>
            )}
            <IconButton
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-label="Toggle filters"
            >
              <FilterListIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Filters */}
        <Collapse in={filtersOpen}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Stack spacing={2}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1">Filters</Typography>
                  <IconButton
                    onClick={clearFilters}
                    size="small"
                    aria-label="Clear filters"
                  >
                    <ClearIcon />
                  </IconButton>
                </Box>

                <Box
                  display="grid"
                  gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
                  gap={2}
                >
                  <TextField
                    label="Search"
                    value={filters.searchText}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        searchText: e.target.value,
                      }))
                    }
                    size="small"
                    fullWidth
                  />

                  <DatePicker
                    label="Date From"
                    value={filters.dateFrom}
                    onChange={(date) =>
                      setFilters((prev) => ({ ...prev, dateFrom: date }))
                    }
                    slotProps={{
                      textField: { size: 'small', fullWidth: true },
                    }}
                  />

                  <DatePicker
                    label="Date To"
                    value={filters.dateTo}
                    onChange={(date) =>
                      setFilters((prev) => ({ ...prev, dateTo: date }))
                    }
                    slotProps={{
                      textField: { size: 'small', fullWidth: true },
                    }}
                  />

                  <FormControl size="small" fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      multiple
                      value={filters.statuses}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          statuses: e.target.value as Status[],
                        }))
                      }
                      input={<OutlinedInput label="Status" />}
                    >
                      {Object.values(Status).map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.replace(/_/g, ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <InputLabel>Scheduling State</InputLabel>
                    <Select
                      multiple
                      value={filters.schedulingStates}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          schedulingStates: e.target.value as SchedulingState[],
                        }))
                      }
                      input={<OutlinedInput label="Scheduling State" />}
                    >
                      {Object.values(SchedulingState).map((state) => (
                        <MenuItem key={state} value={state}>
                          {state}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      multiple
                      value={filters.temporalTypes}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          temporalTypes: e.target.value as string[],
                        }))
                      }
                      input={<OutlinedInput label="Type" />}
                    >
                      {['Past', 'Active', 'Upcoming'].map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Collapse>

        {/* Table Container with Pagination */}
        <Paper elevation={0}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.sortable ? (
                        <TableSortLabel
                          active={orderBy === column.key}
                          direction={orderBy === column.key ? order : 'asc'}
                          onClick={createSortHandler(column.key as SortField)}
                        >
                          {column.label}
                          {orderBy === column.key ? (
                            <Box component="span" sx={visuallyHidden}>
                              {order === 'desc'
                                ? 'sorted descending'
                                : 'sorted ascending'}
                            </Box>
                          ) : null}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRides.map((ride) => {
                  const temporalType = getTemporalType(ride);
                  return (
                    <TableRow
                      key={ride.id}
                      onClick={() => handleRowClick(ride)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.hover' },
                      }}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRowClick(ride);
                      }}
                      aria-label="Open ride details"
                    >
                      <TableCell>{formatDate(ride.startTime)}</TableCell>
                      <TableCell>{formatTime(ride.startTime)}</TableCell>
                      <TableCell>{formatTime(ride.endTime)}</TableCell>
                      <TableCell>{ride.startLocation.name}</TableCell>
                      <TableCell>{ride.endLocation.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={ride.status.replace(/_/g, ' ')}
                          color={getStatusColor(ride.status)}
                          size="small"
                        />
                      </TableCell>
                      {userRole !== 'driver' && (
                        <TableCell>
                          <Chip
                            label={ride.schedulingState}
                            color={getSchedulingStateColor(
                              ride.schedulingState
                            )}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip
                          label={temporalType}
                          color={getTemporalTypeColor(temporalType)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Material-UI TablePagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 15, 20]}
            component="div"
            count={sortedRides.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Rides per page:"
          />
        </Paper>

        {/* Ride Details Modal */}
        {selectedRide && (
          <RideDetailsComponent
            open={detailsOpen}
            onClose={() => {
              setDetailsOpen(false);
              setSelectedRide(null);
            }}
            ride={selectedRide}
            onRideUpdated={(updatedRide) => {
              // Update the selected ride to reflect changes
              setSelectedRide(updatedRide);
              // Note: The parent component should handle refreshing the rides list
            }}
          />
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default RideTable;
