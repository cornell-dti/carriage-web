import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import moment from 'moment';
import { useReq } from '../../context/req';
import { Row, Table } from '../TableComponents/TableComponents';
import { useRiders } from '../../context/RidersContext';
import styles from './table.module.css';

type UsageData = {
  noShows: number;
  totalRides: number;
};
type UsageType = {
  [id: string]: UsageData;
};

type studentTableProps = {
  searchName: string;
};

const StudentsTable = ({ searchName }: studentTableProps) => {
  const { riders } = useRiders();
  const { withDefaults } = useReq();
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
  const [usage, setUsage] = useState<UsageType>({});
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetch('/api/riders/', withDefaults())
      .then((res) => res.json())
      .then((data) => setUsage(data));
  }, [withDefaults]);

  const getUsageData = (id: string) => ({
    data: (
      <div className={styles.usage}>
        <span className={styles.usageContainer}>
          <span className={cn(styles.ridesCount, styles.usageTag)}></span>
          {usage[id]?.totalRides ?? 0} Rides
        </span>
        <span className={styles.usageContainer}>
          <span className={cn(styles.noShow, styles.usageTag)}></span>
          {usage[id]?.noShows ?? 0} No Shows
        </span>
      </div>
    ),
  });

  const fmtPhone = (number: string) => {
    const areaCode = number.slice(0, 3);
    const firstPart = number.slice(3, 6);
    const secondPart = number.slice(6);
    return `(${areaCode}) ${firstPart} ${secondPart}`;
  };
  const formatDate = (date: string): string =>
    moment(date).format('MM/DD/YYYY');

  const filteredStudents = riders.filter(
    (r) =>
      (r.firstName + ' ' + r.lastName)
        .toLowerCase()
        .includes((searchName + '').toLowerCase()) &&
      (showInactive ? true : r.active)
  );

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={showInactive}
          onChange={() => setShowInactive(!showInactive)}
          style={{
            marginLeft: '2rem',
            marginTop: '1rem',
            marginBottom: '1rem',
            marginRight: '0.75rem',
          }}
        />
        Show inactive students
      </label>
      <Table>
        <Row header colSizes={colSizes} data={headers} />

        {filteredStudents.map((r) => {
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
          const disability = accessibility || '';
          const phone = fmtPhone(phoneNumber);
          const shortAddress = address.split(',')[0];
          const joinEndDate = `${formatDate(joinDate)} - ${formatDate(
            endDate
          )}`;
          const usageData = getUsageData(id);
          const isStudentInvalid = moment().isAfter(moment(endDate)) && active;
          const location = {
            pathname: `/riders/${r.id}`,
          };
          const isActive = active ? 'Active' : 'Inactive';
          const data = [
            nameNetId,
            phone,
            shortAddress,
            joinEndDate,
            usageData,
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
              <Row
                data={data}
                colSizes={colSizes}
                className={isStudentInvalid ? styles.invalid : undefined}
              />
            </Link>
          );
        })}
      </Table>
    </>
  );
};

export default StudentsTable;
