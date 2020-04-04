import React, { useState } from 'react';
import '../styles/table.css';

interface Driver {
  name: string;
  netid: string;
  email: string;
  phone: string;
}

interface FormProps {
  onClick: ((newDriver: Driver) => void);
}

function deleteEntry(netid: string, driverList: Driver[]) {
  return driverList.filter(driver => driver.netid !== netid)
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

const Form = (props: FormProps) => {
  const newDriver = { name: '', netid: '', email: '', phone: '' };

  const handleInput = (evt: any) => {
    evt.preventDefault();
    const fieldName = evt.target.name;
    const fieldValue = evt.target.value;
    if (fieldName === 'name') { newDriver.name = fieldValue; }
    else if (fieldName === 'netid') { newDriver.netid = fieldValue; }
    else if (fieldName === 'email') { newDriver.email = fieldValue; }
    else { newDriver.phone = fieldValue; }
  };

  const handleSubmit = (evt: any) => {
    evt.preventDefault();
    props.onClick(newDriver);
  };

  return (
    <>
      <h2 className="formHeader">New Driver</h2>
      <form className="driverForm" onSubmit={(e) => handleSubmit(e)}>
        <div className="formDiv">
          <label htmlFor="name" className="formLabel">Name: </label >
          <input type="text"
            name="name"
            onChange={(e) => handleInput(e)}
          />
        </div>
        <div className="formDiv">
          <label htmlFor="netid" className="formLabel">NetID: </label>
          <input type="text"
            name="netid"
            onChange={(e) => handleInput(e)}
          />
        </div>
        <div className="formDiv">
          <label htmlFor="email" className="formLabel">Email: </label>
          <input type="text"
            name="email"
            onChange={(e) => handleInput(e)}
          />
        </div>
        <div className="formDiv">
          <label htmlFor="phone" className="formLabel">Phone Number: </label>
          <input type="text"
            name="phone"
            onChange={(e) => handleInput(e)}
          />
        </div>
        <input type="submit" value="Submit" />
      </form>
    </>
  );
};

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
        <>
          <tr key={netid}>
            <td className="tableCell">{name}</td>
            <td>{netid}</td>
            <td>{email}</td>
            <td>{phone}</td>
          </tr>
          <button onClick={() => setDrivers(deleteEntry(netid, allDrivers))}>Delete</button>
        </>
      );
    });
  }

  return (
    <>
      <div>
        <h1 className="formHeader">Driver Table</h1>
        <table className="driverTable">
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
