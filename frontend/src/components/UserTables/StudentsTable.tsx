import React from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import moment from 'moment';
import { Row, Table } from '../TableComponents/TableComponents';
import styles from './table.module.css';
import { Rider } from 'types';

type StudentsTableProps = {
  students: Rider[]; // Now receives the filtered list of students as a prop
};

const StudentsTable = ({ students }: StudentsTableProps) => {
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
    const areaCode = number.slice(0, 3);
    const firstPart = number.slice(3, 6);
    const secondPart = number.slice(6);
    return `(${areaCode}) ${firstPart} ${secondPart}`;
  };

  const formatDate = (date: string): string =>
    moment(date).format('MM/DD/YYYY');

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
        const location = {
          pathname: `/riders/${r.id}`,
        };

        const data = [
          nameNetId,
          phone,
          shortAddress,
          joinEndDate,
          '0 Rides / 0 No Shows', // You can add real usage data here
          disability,
          isActive,
          'Edit',
        ];

        return (
          <Link
            key={id}
            to={location}
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Row data={data} colSizes={colSizes} />
          </Link>
        );
      })}
    </Table>
  );
};

export default StudentsTable;
