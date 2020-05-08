import React, { useState } from 'react';
import '../styles/table.css';

interface Driver {
  name: string;
  email: string;
  phone: string;
}

interface FormProps {
  onClick: ((newDriver: Driver) => void);
}

function deleteEntry(email: string, driverList: any[]) {
  return driverList.filter(driver => driver.email !== email)
}

function renderTableHeader() {
  return (
    <tr>
      <th className="tableHeader">Name</th>
      {/* <th className="tableHeader">Netid</th> */}
      <th className="tableHeader">Email</th>
      <th className="tableHeader">Phone Number</th>
    </tr>
  );
}

function addDriver(newDriver: any, allDrivers: any[]) {
  return [...allDrivers, newDriver];
}

const Form = (props: FormProps) => {
  const [newDriver, setNewDriver] = useState({ name: '', email: '', phone: '' });
  const [validName, setValidName] = useState(false);
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
    let validAddDriver = validName && validEmail && validPhone;
    if (validAddDriver) { props.onClick(newDriver); }
  };

  return (
    <>
      <h2 className="formHeader">New Driver</h2>
      <div className="addFormDiv">
        <form className="addForm" onSubmit={(e) => handleSubmit(e)}>
          <div className="formDiv">
            <label htmlFor="name" className="formLabel">Name: </label >
            <input type="text"
              name="name"
              onChange={(e) => handleInput(e)}
              required
            />
            <p className={`formFeedback ${validName ? "hidden" : ""}`}>
              Enter a name
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
              Enter a phone number in the form xxx-xxx-xxxx
          </p>
          </div>
          <input type="submit" value="Submit" />
        </form>
      </div>
    </>
  );
};

const Table = () => {
  const [drivers, setDrivers] = useState([
    { name: 'Driver1', email: 'abc123@cornell.edu', phone: '111-111-1111' },
    { name: 'Driver2', email: 'asd23@cornell.edu', phone: '222-222-2222' },
    { name: 'Driver3', email: 'advs12@cornell.edu', phone: '333-333-3333' },
    { name: 'Driver4', email: 'bfd2@cornell.edu', phone: '444-444-4444' },
  ]);

  useEffect(() => {
    const fetchDrivers = async () => {
      const data = fetch("/riders", {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
        .then(res => res.json())
        .then(data => setDrivers(data['data']))
        .catch(err => {
          console.log('Error while fetching:', err);
        });
    }

    fetchDrivers();
  });

  function renderTableData(allDrivers: any[]) {
    return allDrivers.map((driver, index) => {
      const { firstName, lastName, email, phoneNumber } = driver;
      return (
        <>
          <tr key={email}>
            <td className="tableCell">{firstName + ' ' + lastName}</td>
            {/* <td></td> */}
            <td>{email}</td>
            <td>{phoneNumber}</td>
          </tr>
          <button onClick={() => setDrivers(deleteEntry(email, allDrivers))}>Delete</button>
        </>
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

const DriverTable = () => (
  <Table />
);

export default DriverTable;
