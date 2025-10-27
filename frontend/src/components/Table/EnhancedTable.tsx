import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { visuallyHidden } from '@mui/utils';
import { RideType, Type, Status } from '@carriage-web/shared/types/ride';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

type Order = 'asc' | 'desc';

interface Data {
  startTime: string;
  date: string;
  time: string;
  startLocationName: string;
  endLocationName: string;
  status: Status;
  type: Type;
}

function formatDateAndTime(isoString: string): { date: string; time: string } {
  const d = new Date(isoString);
  return {
    date: d.toLocaleDateString(),
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

function mapRidesToData(rides: RideType[]): Data[] {
  return rides.map((ride) => {
    const { date, time } = formatDateAndTime(ride.startTime);
    return {
      startTime: ride.startTime,
      date,
      time,
      startLocationName: ride.startLocation.name,
      endLocationName: ride.endLocation.name,
      status: ride.status,
      type: ride.type as any,
    };
  });
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  let aVal = a[orderBy];
  let bVal = b[orderBy];

  if (typeof aVal === 'string' && typeof bVal === 'string') {
    return bVal.localeCompare(aVal);
  }

  if (bVal < aVal) {
    return -1;
  }
  if (bVal > aVal) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof Data>(
  order: Order,
  orderBy: Key
): (a: Data, b: Data) => number {
  return (a, b) => {
    let sortField = orderBy;
    if (orderBy === 'date' || orderBy === 'time') {
      sortField = 'startTime' as Key;
    }

    const cmp = descendingComparator(a, b, sortField);
    return order === 'desc' ? cmp : -cmp;
  };
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  { id: 'date', numeric: false, disablePadding: false, label: 'Date' },
  { id: 'time', numeric: false, disablePadding: false, label: 'Time' },
  {
    id: 'startLocationName',
    numeric: false,
    disablePadding: false,
    label: 'Pick up',
  },
  {
    id: 'endLocationName',
    numeric: false,
    disablePadding: false,
    label: 'Drop off',
  },
  { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
  { id: 'type', numeric: false, disablePadding: false, label: 'Type' },
];

interface EnhancedTableProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => void;
  order: Order;
  orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.label}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ fontWeight: 'bold' }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  statusFilter: Status | 'All';
  onStatusFilterChange: (status: Status | 'All') => void;
  availableStatuses: (Status | 'All')[];
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { statusFilter, onStatusFilterChange, availableStatuses } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
      }}
    >
      <Typography
        sx={{ flex: '1 1 100%' }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        Rides
      </Typography>

      <FormControl size="small" sx={{ width: 120 }}>
        <InputLabel id="status-filter-label">Status</InputLabel>
        <Select
          labelId="status-filter-label"
          id="status-filter"
          value={statusFilter}
          label="Status"
          onChange={(e) =>
            onStatusFilterChange(e.target.value as Status | 'All')
          }
        >
          {availableStatuses.map((st) => (
            <MenuItem key={st} value={st}>
              {st}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Toolbar>
  );
}

interface EnhancedTableComponentProps {
  rides: RideType[];
}

export default function EnhancedTable({ rides }: EnhancedTableComponentProps) {
  const rows = React.useMemo(() => mapRidesToData(rides), [rides]);

  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('date');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [statusFilter, setStatusFilter] = React.useState<Status | 'All'>('All');

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
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

  const filteredRows = React.useMemo(() => {
    if (statusFilter === 'All') {
      return rows;
    }
    return rows.filter((row) => row.status === statusFilter);
  }, [rows, statusFilter]);

  const sortedRows = React.useMemo(
    () => [...filteredRows].sort(getComparator(order, orderBy)),
    [filteredRows, order, orderBy]
  );

  const visibleRows = React.useMemo(
    () =>
      sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedRows, page, rowsPerPage]
  );

  const availableStatuses: (Status | 'All')[] = [
    'All',
    ...Array.from(new Set(rows.map((r) => r.status))),
  ];

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - sortedRows.length) : 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          availableStatuses={availableStatuses}
        />
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const labelId = `enhanced-table-row-${index}`;
                return (
                  <TableRow hover role="row" tabIndex={-1} key={index}>
                    <TableCell component="th" id={labelId} scope="row">
                      {row.date}
                    </TableCell>
                    <TableCell>{row.time}</TableCell>
                    <TableCell>{row.startLocationName}</TableCell>
                    <TableCell>{row.endLocationName}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.type}</TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
