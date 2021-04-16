import React from 'react';
import { useHistory } from 'react-router-dom';
import TableRow from '../TableComponents/TableRow';
import { NewRider } from '../../types';
import styles from './table.module.css';
import { useRiders } from '../../context/RidersContext';

function renderTableHeader() {
  return (
    <tr>
      <th className={styles.tableHeader}>Name / NetId</th>
      <th className={styles.tableHeader}>Number</th>
      <th className={styles.tableHeader}>Address</th>
      <th className={styles.tableHeader}>Duration</th>
      <th className={styles.tableHeader}>Disability</th>
    </tr>
  );
}

function renderAccessNeeds(accessNeeds: Array<string>) {
  let allNeeds = '';
  const separator = ', ';
  if (accessNeeds != null && accessNeeds.length > 0) {
    for (let i = 0; i < accessNeeds.length; i += 1) {
      if (i !== accessNeeds.length - 1) {
        allNeeds = allNeeds + accessNeeds[i] + separator;
      } else {
        allNeeds += accessNeeds[i];
      }
    }
    return allNeeds;
  }
  return null;
}
const RidersTable = () => {
  const history = useHistory();
  const { riders } = useRiders();
  function renderTableData(allRiders: NewRider[]) {
    return allRiders.map((rider, index) => {
      const {
        firstName,
        lastName,
        phoneNumber,
        address,
        joinDate,
        endDate,
        email,
        accessibility,
      } = rider;
      const valuePhone = { data: phoneNumber };
      const valueAddress = { data: address };
      const valueDuration = {
        data:
          endDate
            ? `${joinDate} - ${endDate}`
            : `${joinDate} -`,
      };
      const valueAccessbility = { data: renderAccessNeeds(accessibility) };
      const netId = email.split('@')[0];
      const valueNameNetid = {
        data:
          <span>
            <span style={{ fontWeight: 'bold' }}>
              {`${firstName} ${lastName}`}
            </span>
            {` ${netId}`}
          </span>,
      };
      const inputValues = [
        valueNameNetid,
        valuePhone,
        valueAddress,
        valueDuration,
        valueAccessbility,
      ];
      const riderData = {
        firstName,
        lastName,
        netID: netId,
        phone: phoneNumber,
        accessibility: renderAccessNeeds(accessibility),
        photoLink: rider.photoLink,
      };
      const location = {
        pathname: '/riders/rider',
        state: riderData,
        search: `?name=${`${firstName}_${lastName}`}`,
      };
      const goToDetail = () => {
        history.push(location);
      };
      return (
        <tr key={index} onClick={goToDetail} className={styles.tableRow}>
          <TableRow values={inputValues} />
        </tr>
      );
    });
  }
  return (
    <>
      <div>
        <div className={styles.tableContainer}>
          <table cellSpacing="0" className={styles.table}>
            <tbody>
              {renderTableHeader()}
              {renderTableData(riders)}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};


export default RidersTable;
