import React, { useEffect, Dispatch, SetStateAction } from 'react';
import { useHistory } from 'react-router-dom';
import TableRow from '../TableComponents/TableRow';
import { NewRider } from '../../types'; 
import styles from './table.module.css';
import { useReq } from '../../context/req';

type RidersTableProps = {
  riders: Array<NewRider>;
  setRiders: Dispatch<SetStateAction<NewRider[]>>;
};

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
  const comma = ', ';
  if (accessNeeds != null) {
    for (let i = 0; i < accessNeeds.length; i += 1) {
      if (i !== accessNeeds.length - 1) {
        allNeeds = allNeeds + accessNeeds[i] + comma;
      } else {
        allNeeds += accessNeeds[i];
      }
    }
    return allNeeds;
  }
  return null;
}

const RidersTable = ({ riders, setRiders }: RidersTableProps) => {
  const history = useHistory();
  const { withDefaults } = useReq();

  useEffect(() => {
    async function getExistingRiders() {
      const ridersData = await fetch('/api/riders', withDefaults())
        .then((res) => res.json())
        .then((data) => data.data);

      setRiders(ridersData);
    }
    getExistingRiders();
  }, [setRiders, withDefaults]);

  function deleteEntry(email: string, riderList: NewRider[]) {
    const riderId = riderList.filter((rider) => rider.email === email)[0].id;
    async function deleteBackend() {
      await fetch(`/riders/${riderId}`, withDefaults({ method: 'DELETE' }));
    }
    deleteBackend();
    return riderList.filter((rider) => rider.email !== email);
  }
  function renderTableData(allRiders: NewRider[]) {
    return allRiders.map((rider, index) => {
      const {
        firstName,
        lastName,
        phoneNumber,
        address,
        joinDate,
        email,
        accessibility,
      } = rider;
      const valuePhone = { data: phoneNumber };
      const valueAddress = { data: address };
      const valueJoinDate = { data: joinDate };
      const valueAccessbility = { data: renderAccessNeeds(accessibility) };
      const editRider = () => {
        console.log('Edit rider pressed!');
      };
      const valueEdit = {
        data: 'Edit',
        buttonHandler: () => editRider(), // placeholder function
      };
      const netId = email.split('@')[0];
      const valueNameNetid = {
        data: 
        <span>
          <span style={{ fontWeight: 'bold' }}>
            {firstName + ' ' + lastName}
          </span>
          {' ' + netId}
        </span>
      };
      console.log(valueAccessbility);
      const inputValues = [
        valueNameNetid,
        valuePhone,
        valueAddress,
        valueJoinDate,
        valueAccessbility,
        valueEdit,
      ];
      const riderData = {
        firstName,
        lastName,
        netID: netId,
        phone: phoneNumber,
        accessibility: renderAccessNeeds(accessibility),
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
        <h1 className={styles.formHeader}>Riders</h1>
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
