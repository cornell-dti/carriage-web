import React from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
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

  const fmtPhone = (number: string) => {
    const areaCode = number?.slice(0, 3);
    const firstPart = number?.slice(3, 6);
    const secondPart = number?.slice(6);
    return `(${areaCode}) ${firstPart} ${secondPart}`;
  };

  const formatDate = (date: string): string =>
    moment(date).format('MM/DD/YYYY');

  const handleRowClick = (id: string) => {
    navigate(`/admin/riders/${id}`);
  };

  return (
    <Table>
      <Row header colSizes={colSizes} data={headers} />
      {students.map((r) => {
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
        const shortAddress = address.split(',')[0];
        const joinEndDate = `${formatDate(joinDate)} - ${formatDate(endDate)}`;
        const isActive = active ? 'Active' : 'Inactive';

        const data = [
          nameNetId,
          phone,
          shortAddress,
          joinEndDate,
          '0 Rides / 0 No Shows',
          disability,
          isActive,
          'Edit',
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
  );
};

export default StudentsTable;
