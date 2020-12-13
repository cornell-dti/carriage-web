import React, { useEffect, Dispatch, SetStateAction } from 'react';
import { useHistory } from 'react-router-dom';
import TableRow from '../TableComponents/TableRow';
import { Rider } from '../../types';
import styles from './table.module.css';

type RidersTableProps = {
  riders: Array<Rider>;
  setRiders: Dispatch<SetStateAction<Rider[]>>;
};

function renderTableHeader() {
  return (
    <tr>
      <th className={styles.tableHeader}>First Name</th>
      <th className={styles.tableHeader}>Last Name</th>
      <th className={styles.tableHeader}>Phone Number</th>
      <th className={styles.tableHeader}>Email</th>
      <th className={styles.tableHeader}>Accessibility Needs</th>
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

  useEffect(() => {
    async function getExistingRiders() {
      const ridersData = await fetch('/riders')
        .then((res) => res.json())
        .then((data) => data.data);

      const allRiders: Rider[] = ridersData.map((rider: any) => ({
        id: rider.id,
        firstName: rider.firstName,
        lastName: rider.lastName,
        phoneNumber: rider.phoneNumber,
        email: rider.email,
        accessibilityNeeds: rider.accessibilityNeeds,
        description: rider.description,
        joinDate: rider.joinDate,
        pronouns: rider.pronouns,
        address: rider.address,
      }));
      setRiders(allRiders);
    }
    getExistingRiders();
  }, [setRiders]);

  function deleteEntry(email: string, riderList: Rider[]) {
    const riderId = riderList.filter((rider) => rider.email === email)[0].id;
    async function deleteBackend() {
      const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      };
      await fetch(`/riders/${riderId}`, requestOptions);
    }
    deleteBackend();
    return riderList.filter((rider) => rider.email !== email);
  }

  function renderTableData(allRiders: Rider[]) {
    return allRiders.map((rider, index) => {
      const {
        firstName,
        lastName,
        phoneNumber,
        email,
        accessibilityNeeds,
      } = rider;
      const buttonText = 'Delete';
      const valueFName = { data: firstName };
      const valueLName = { data: lastName };
      const valuePhone = { data: phoneNumber };
      const valueEmail = { data: email };
      const valueAccessbility = { data: renderAccessNeeds(accessibilityNeeds) };
      const valueDelete = {
        data: buttonText,
        buttonHandler: () => setRiders(deleteEntry(email, allRiders)),
      };
      const inputValues = [
        valueFName,
        valueLName,
        valuePhone,
        valueEmail,
        valueAccessbility,
        valueDelete,
      ];
      const netId = email.split('@')[0];
      const riderData = {
        firstName,
        lastName,
        netID: netId,
        phone: phoneNumber,
        accessibility: renderAccessNeeds(accessibilityNeeds),
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
