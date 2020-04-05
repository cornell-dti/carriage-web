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
  const [newDriver, setNewDriver] = useState({ name: '', netid: '', email: '', phone: '' });
  const [validName, setValidName] = useState(false);
  const [validNetid, setValidNetid] = useState(false);
  const [validEmail, setValidEmail] = useState(false);
  const [validPhone, setValidPhone] = useState(false);

  const handleInput = (evt: any) => {
    evt.preventDefault();
    const fieldName = evt.target.name;
    const fieldValue = evt.target.value;
    if (fieldName === 'name') {
      if (fieldValue.length > 0) {
        newDriver.name = fieldValue;
        setValidName(true);
      } else {
        newDriver.name = "";
        setValidName(false);
      }
    }
    else if (fieldName === 'netid') {
      const netIdFormat = /^[a-zA-Z]+[0-9]+$/;
      if ((fieldValue.length > 0) && fieldValue.match(netIdFormat)) {
        newDriver.netid = fieldValue;
        setValidNetid(true);
      } else {
        newDriver.netid = "";
        setValidNetid(false);
      }
    }
    else if (fieldName === 'email') {
      const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if ((fieldValue.length > 0) && fieldValue.match(emailFormat)) {
        newDriver.email = fieldValue;
        setValidEmail(true);
      } else {
        newDriver.email = "";
        setValidEmail(false);
      }
    }
    else {
      const phoneFormat = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
      if ((fieldValue.length > 0) && fieldValue.match(phoneFormat)) {
        newDriver.phone = fieldValue;
        setValidPhone(true);
      } else {
        newDriver.phone = "";
        setValidPhone(false);
      }
    }
    setNewDriver(newDriver);
  };
  const handleSubmit = (evt: any) => {
    evt.preventDefault();
    let addDriver = validName && validNetid && validEmail && validPhone;
    if (addDriver) { props.onClick(newDriver); }
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
            required
          />
          <p className={`formFeedback ${validName ? "hidden" : ""}`}>
            Please enter a name
          </p>
        </div>
        <div className="formDiv">
          <label htmlFor="netid" className="formLabel">NetID: </label>
          <input type="text"
            name="netid"
            onChange={(e) => handleInput(e)}
          />
          <p className={`formFeedback ${validNetid ? "hidden" : ""}`}>
            Please enter a valid netid
          </p>
        </div>
        <div className="formDiv">
          <label htmlFor="email" className="formLabel">Email: </label>
          <input type="text"
            name="email"
            onChange={(e) => handleInput(e)}
          />
          <p className={`formFeedback ${validEmail ? "hidden" : ""}`}>
            Please enter a valid email address
          </p>
        </div>
        <div className="formDiv">
          <label htmlFor="phone" className="formLabel">Phone Number: </label>
          <input type="text"
            name="phone"
            placeholder="XXX-XXX-XXXX"
            onChange={(e) => handleInput(e)}
          />
          <p className={`formFeedback ${validPhone ? "hidden" : ""}`}>
            Please enter a phone number in the form xxx-xxx-xxxx
          </p>
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
