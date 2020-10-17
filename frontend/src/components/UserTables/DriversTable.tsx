import React, { useState } from 'react';
import Form from '../UserForms/DriversForm';

type Driver = {
  name: string,
  netid: string,
  email: string,
  phone: string,
}

function deleteEntry(netid: string, driverList: Driver[]) {
  return driverList.filter((driver) => driver.netid !== netid);
}

function renderTableHeader() {
  return (
    <tr>
      <th className="tableHeader">Name</th>
      <th className="tableHeader">Netid</th>
      <th className="tableHeader">Email</th>
      <th className="tableHeader">Phone Number</th>
    </tr>
  );
}

function addDriver(newDriver: Driver, allDrivers: Driver[]) {
  return [...allDrivers, newDriver];
}

const Table = () => {
  const [drivers, setDrivers] = useState([
    { name: 'Driver1', netid: 'abc123', email: 'abc123@cornell.edu', phone: '111-111-1111' },
    { name: 'Driver2', netid: 'asd23', email: 'asd23@cornell.edu', phone: '222-222-2222' },
    { name: 'Driver3', netid: 'advs12', email: 'advs12@cornell.edu', phone: '333-333-3333' },
    { name: 'Driver4', netid: 'bfd2', email: 'bfd2@cornell.edu', phone: '444-444-4444' },
  ]);

  function renderTableData(allDrivers: Driver[]) {
    return allDrivers.map((driver, index) => {
      const { name, netid, email, phone } = driver;
      return (
        <tr key={netid}>
          <td className="tableCell">{name}</td>
          <td>{netid}</td>
          <td>{email}</td>
          <td>{phone}</td>
          <td>
            <button
              onClick={() => setDrivers(deleteEntry(netid, allDrivers))}>
              Delete
              </button>
          </td>
        </tr>
      );
    });
  }

  return (
    <>
      <div>
        <h1 className="formHeader">Driver Table</h1>
        <table className="table">
          <tbody>
            {renderTableHeader()}
            {renderTableData(drivers)}
          </tbody>
        </table>
      </div >
      <div>
        <Form onClick={(newDriver) => setDrivers(addDriver(newDriver, drivers))} />
      </div>
    </>
  );
};

export default Table;
