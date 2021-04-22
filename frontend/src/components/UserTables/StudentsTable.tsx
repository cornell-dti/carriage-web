import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import cn from 'classnames';
import { useReq } from '../../context/req';
import { Row, Table } from '../TableComponents/TableComponents';
import { useRiders } from '../../context/RidersContext';
import styles from './table.module.css';


const StudentsTable = () => {
  const { riders } = useRiders();
  const history = useHistory();
  const { withDefaults } = useReq();
  const colSizes = [1, 0.75, 0.75, 1, 1.25, 1];
  const headers = ['Name / NetId', 'Number', 'Address', 'Usage', 'Duration', 'Disability'];
  const [usage, setUsage] = useState({ studentRides: -1, noShowCount: -1 });
  const getUsageData = (id: string) => {
    fetch(`/api/riders/${id}/usage`, withDefaults())
      .then((res) => (res.json()))
      .then((data) => setUsage(data));
    return {
      data:
        <span>
          <span className={styles.usageContainer}>
            <span className={cn(styles.ridesCount, styles.usageTag)}></span>
            {usage.studentRides} Rides
          </span>
          <span className={styles.usageContainer}>
            <span className={cn(styles.noShow, styles.usageTag)}></span>
            {usage.noShowCount} No Shows
          </span>
        </span>,
    };
  };

  const fmtPhone = (number: string) => {
    const areaCode = number.slice(0, 3);
    const firstPart = number.slice(3, 6);
    const secondPart = number.slice(6);
    return `(${areaCode}) ${firstPart} ${secondPart}`;
  };
  return (
    <Table>
      <Row
        header
        colSizes={colSizes}
        data={headers.map((h) => ({ data: h }))}
      />
      {riders.map((r) => {
        const { id, firstName, lastName, email, address, phoneNumber, joinDate, accessibility } = r;
        const netId = email.split('@')[0];
        const nameNetId = {
          data:
            <span>
              <span style={{ fontWeight: 'bold' }}>
                {`${firstName} ${lastName}`}
              </span>
              {` ${netId}`}
            </span>,
        };
        const disability = accessibility.join(', ');
        const phone = fmtPhone(phoneNumber);
        const shortAddress = address.split(',')[0];
        const usageData = getUsageData(id);
        const riderData = {
          firstName,
          lastName,
          netID: netId,
          phone,
          accessibility: disability,
        };
        const location = {
          pathname: '/riders/rider',
          state: riderData,
          search: `?name=${`${firstName}_${lastName}`}`,
        };
        const goToDetail = () => {
          history.push(location);
        };
        const data = [nameNetId, phone, shortAddress, usageData, joinDate, disability];
        return <Row data={data} colSizes={colSizes} onClick={goToDetail} />;
      })}
    </Table>
  );
};

export default StudentsTable;
