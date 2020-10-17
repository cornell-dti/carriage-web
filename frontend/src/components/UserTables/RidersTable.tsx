import React, { useState, useEffect } from 'react';
import TableRow from '../TableComponents/TableRow';
import Form from '../UserForms/RidersForm';
import { AccessibilityNeeds, Rider } from '../../types';
import styles from './table.module.css';


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

function renderAccessNeeds(accessNeeds: AccessibilityNeeds) {
  let allNeeds = '';
  if (accessNeeds != null) {
    const arrayNeeds = Object.entries(accessNeeds);
    arrayNeeds.forEach((element) => {
      if (element[0] === 'hasCrutches' && element[1]) {
        allNeeds = allNeeds.concat('Has Crutches, ');
      } else if (element[0] === 'needsAssistant' && element[1]) {
        allNeeds = allNeeds.concat('Needs Assistant, ');
      } else if (element[0] === 'needsWheelchair' && element[1]) {
        allNeeds = allNeeds.concat('Needs Wheelchair, ');
      }
    });
    return allNeeds.substr(0, allNeeds.length - 2);
  }
  return null;
}

const Table = () => {
  const [riders, setRiders] = useState(
    [
      {
        id: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        accessibilityNeeds:
          { needsWheelchair: false, hasCrutches: false, needsAssistant: false },
        description: '',
        joinDate: '',
        pronouns: '',
        address: '',
      },
    ],
  );

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
  }, []);

  function deleteEntry(email: string, riderList: Rider[]) {
    const riderId = (riderList.filter((rider) => rider.email === email))[0].id;
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

  function addRider(newRider: Rider, allRiders: Rider[]) {
    async function addBackend() {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newRider.firstName,
          lastName: newRider.lastName,
          phoneNumber: newRider.phoneNumber,
          email: newRider.email,
          accessibilityNeeds: {
            needsWheelchair: newRider.accessibilityNeeds.needsWheelchair,
            hasCrutches: newRider.accessibilityNeeds.hasCrutches,
            needsAssistant: newRider.accessibilityNeeds.needsAssistant,
          },
          description: newRider.description,
          joinDate: newRider.joinDate,
          pronouns: newRider.pronouns,
          address: newRider.address,
        }),
      };
      await fetch('/riders', requestOptions);
    }
    addBackend();
    return [...allRiders, newRider];
  }

  function renderTableData(allRiders: Rider[]) {
    return allRiders.map((rider, index) => {
      const {
        firstName, lastName, phoneNumber, email, accessibilityNeeds,
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
      const inputValues = [valueFName, valueLName, valuePhone, valueEmail,
        valueAccessbility, valueDelete];
      return (
        <tr key={index}>
          <TableRow values={inputValues} />
        </tr>
      );
    });
  }

  return (
    <>
      <div>
        <h1 className={styles.formHeader}>Rider Table</h1>
        <table cellSpacing='0' className={styles.table}>
          <tbody>
            {renderTableHeader()}
            {renderTableData(riders)}
          </tbody>
        </table>
      </div >
      <div>
        <Form onClick={(newRider) => (setRiders(addRider(newRider, riders)))} />
      </div>
    </>
  );
};

export default Table;
