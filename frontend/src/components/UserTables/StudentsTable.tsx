import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { Row, Table } from '../TableComponents/TableComponents';
import styles from './table.module.css';
import { Rider } from 'types';

type StudentsTableProps = {
  students: Rider[];
};

const StudentsTable = ({ students }: StudentsTableProps) => {
  const navigate = useNavigate();
  const colSizes = [1, 0.75, 0.75, 1, 1.25, 1, 1, 1];
  const headers = [
    'Name / NetId',
    'Number',
    'Address',
    'Date',
    'Usage',
    'Disability',
    'Activity',
    '',
  ];
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const totalPages = Math.ceil(students.length / rowsPerPage);
  const currentStudents = students.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const fmtPhone = (number: string | undefined) => {
    if (!number || number.length !== 10) return 'N/A';
    const areaCode = number.slice(0, 3);
    const firstPart = number.slice(3, 6);
    const secondPart = number.slice(6);
    return `(${areaCode}) ${firstPart} ${secondPart}`;
  };

  const formatDate = (date: string): string =>
    moment(date).format('MM/DD/YYYY');

  const handleRowClick = (id: string) => {
    navigate(`/admin/riders/${id}`);
  };

  // Custom button style
  const editButtonStyle = {
    backgroundColor: 'white',
    color: 'black',
    border: '1px solid black',
    '&:hover': {
      backgroundColor: '#f5f5f5',
      border: '1px solid black',
    },
  };

  return (
    <>
      <Table>
        <Row header colSizes={colSizes} data={headers} />
        {currentStudents.map((r) => {
          const {
            id,
            firstName,
            lastName,
            email,
            address,
            phoneNumber,
            accessibility,
            joinDate,
            endDate,
            active,
          } = r;

          const netId = email.split('@')[0];
          const nameNetId = {
            data: (
              <span>
                <span style={{ fontWeight: 'bold' }}>
                  {`${firstName} ${lastName}`}
                </span>
                {` ${netId}`}
              </span>
            ),
          };

          const disability =
            accessibility && accessibility.length > 0
              ? accessibility.join(', ')
              : 'None';

          const phone = fmtPhone(phoneNumber);
          const shortAddress = address?.split(',')[0] ?? 'N/A';
          const joinEndDate = `${formatDate(joinDate)} - ${formatDate(
            endDate
          )}`;
          const isActive = active ? 'Active' : 'Inactive';

          // Material UI Edit button with custom styling
          const editButton = {
            data: (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRowClick(id);
                }}
                sx={editButtonStyle}
              >
                Edit
              </Button>
            ),
          };

          const data = [
            nameNetId,
            phone,
            shortAddress,
            joinEndDate,
            '0 Rides / 0 No Shows',
            disability,
            isActive,
            editButton,
          ];

          return (
            <div
              key={id}
              onClick={() => handleRowClick(id)}
              style={{ cursor: 'pointer' }}
            >
              <Row data={data} colSizes={colSizes} />
            </div>
          );
        })}
      </Table>

      {/* Pagination component */}
      <Stack
        spacing={2}
        sx={{
          mt: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          size="large"
          showFirstButton
          showLastButton
        />
      </Stack>
    </>
  );
};

export default StudentsTable;
