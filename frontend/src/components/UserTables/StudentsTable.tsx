import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import moment from 'moment';
import { Row, Table } from '../TableComponents/TableComponents';
import { useRiders } from '../../context/RidersContext';
import styles from './table.module.css';
import axios from '../../util/axios';
import { Label } from '../FormElements/FormElements';
import { Accessibility } from '../../types';

type UsageData = {
  noShows: number;
  totalRides: number;
};

type UsageType = {
  [id: string]: UsageData;
};

type StudentTableProps = {
  searchName: string;
};

const StudentsTable = ({ searchName }: StudentTableProps) => {
  const { riders } = useRiders();
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

  const [disabilityFilter, setDisabilityFilter] = useState<Accessibility[]>([]);

  useEffect(() => {
    axios
      .get('/api/riders/')
      .then((res) => res.data)
      .then((data) => setUsage(data));
  }, []);

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

  const handleDisabilityFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedOptions = Array.from(
      event.target.selectedOptions,
      (option) => option.value as Accessibility
    );
    setDisabilityFilter(selectedOptions);
  };

  const filteredStudents = riders.filter((r) => {
    const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
    const searchLower = searchName.toLowerCase();

    const matchesName = fullName.includes(searchLower);
    const matchesActive = showInactive ? true : r.active;

    const matchesDisability =
      disabilityFilter.length === 0
        ? true
        : (r.accessibility || []).some((disability) =>
            disabilityFilter.includes(disability)
          );

    return matchesName && matchesActive && matchesDisability;
  });

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={showInactive}
          onChange={() => setShowInactive(!showInactive)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setShowInactive(!showInactive);
            }
          }}
          style={{
            marginLeft: '2rem',
            marginTop: '1rem',
            marginBottom: '1rem',
            marginRight: '0.75rem',
          }}
        />
        Show inactive students
      </label>
      <div>
        <Label
          className={styles.filterDisabilityHeader}
          htmlFor="filterByDisability"
        >
          Filter by Disability:
        </Label>
        <select
          id="filterByDisability"
          multiple
          value={disabilityFilter}
          onChange={handleDisabilityFilterChange}
          className={styles.filterDisabilityDropdown}
        >
          {Object.values(Accessibility).map((value, index) => (
            <option key={index} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
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

          // Displaying disabilities as a comma-separated string
          const disability =
            accessibility && accessibility.length > 0
              ? accessibility.join(', ')
              : 'None';

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
