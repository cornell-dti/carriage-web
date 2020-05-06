import React, { useState, useEffect } from 'react';
import '../styles/table.css';
import SignInButton from './signin'

interface AccessibilityNeeds {
  needsWheelchair: boolean;
  hasCrutches: boolean;
  needsAssistant: boolean;
}

interface Rider {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  accessibilityNeeds: AccessibilityNeeds;
  description: string;
  joinDate: string;
  pronouns: string;
  address: string;
}

interface FormProps {
  onClick: ((newRider: Rider) => void);
}

function deleteEntry(email: string, riderList: Rider[]) {
  return riderList.filter(rider => rider.email !== email)
}

function renderTableHeader() {
  return (
    <tr>
      <th className="tableHeader">First Name</th>
      <th className="tableHeader">Last Name</th>
      <th className="tableHeader">Phone Number</th>
      <th className="tableHeader">Email</th>
      <th className="tableHeader">Accessibility Needs</th>
      <th className="tableHeader">Description</th>
      <th className="tableHeader">Join Date</th>
      <th className="tableHeader">Pronouns</th>
      <th className="tableHeader">Address</th>
    </tr>
  );
}

function addRider(newRider: Rider, allRiders: Rider[]) {
  return [...allRiders, newRider];
}

const Form = (props: FormProps) => {
  let today = new Date();
  let date = (today.getMonth() + 1) + "/" + today.getDate() + "/" +
    today.getFullYear();
  const [newRider, setNewRider] =
    useState({
      firstName: '', lastName: '', phoneNumber: '', email: '',
      accessibilityNeeds:
        { needsWheelchair: false, hasCrutches: false, needsAssistant: false },
      description: '', joinDate: date, pronouns: 'she', address: ''
    });
  const [validFirstName, setValidFirstName] = useState(false);
  const [validLastName, setValidLastName] = useState(false);
  const [validPhone, setValidPhone] = useState(false);
  const [validEmail, setValidEmail] = useState(false);
  const [validDesc, setValidDesc] = useState(false);
  const [validAddress, setValidAddress] = useState(false);

  const handleInput = (evt: any) => {
    const fieldName = evt.target.name;
    const fieldValue = evt.target.value;
    const fieldId = evt.target.id;
    if (fieldName === 'firstName') {
      if (fieldValue.length > 0) {
        newRider.firstName = fieldValue;
        setValidFirstName(true);
      } else {
        newRider.firstName = "";
        setValidFirstName(false);
      }
    }
    else if (fieldName === 'lastName') {
      if (fieldValue.length > 0) {
        newRider.lastName = fieldValue;
        setValidLastName(true);
      } else {
        newRider.lastName = "";
        setValidLastName(false);
      }
    }
    else if (fieldName === 'phone') {
      const phoneFormat = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
      if ((fieldValue.length > 0) && fieldValue.match(phoneFormat)) {
        newRider.phoneNumber = fieldValue;
        setValidPhone(true);
      } else {
        newRider.phoneNumber = "";
        setValidPhone(false);
      }
    }
    else if (fieldName === 'email') {
      const netIdFormat = /^[a-zA-Z]+[0-9]+$/;
      if ((fieldValue.length > 0) && fieldValue.match(netIdFormat)) {
        newRider.email = fieldValue.concat('@cornell.edu');
        setValidEmail(true);
      } else {
        newRider.email = "";
        setValidEmail(false);
      }
    }
    else if (fieldName === 'description') {
      if (fieldValue.length > 0) {
        newRider.description = fieldValue;
        setValidDesc(true);
      } else {
        newRider.description = "";
        setValidDesc(false);
      }
    }
    else if (fieldName === 'address') {
      if (fieldValue.length > 0) {
        newRider.address = fieldValue;
        setValidAddress(true);
      } else {
        newRider.address = "";
        setValidAddress(false);
      }
    }
    else if (fieldName === 'pronouns') {
      newRider.pronouns = fieldValue;
    }
    else {
      if (fieldName === "needWheel") {
        newRider.accessibilityNeeds.needsWheelchair = true
      } if (fieldName === "needCrutches") {
        newRider.accessibilityNeeds.hasCrutches = true
      } else {
        newRider.accessibilityNeeds.needsAssistant = true
      }
    }
    setNewRider(newRider);
  };
  const handleSubmit = (evt: any) => {
    evt.preventDefault();
    let validRider = validFirstName && validLastName && validPhone &&
      validEmail && validDesc && validAddress;
    if (validRider) { props.onClick(newRider); }
  };
  return (
    <>
      <h2 className="formHeader">New Rider</h2>
      <div className="addFormDiv">
        <form className="addForm" onSubmit={(e) => handleSubmit(e)}>
          <div className="formDiv">
            <label htmlFor="firstName" className="formLabel">First Name: </label >
            <input type="text"
              name="firstName"
              onChange={(e) => handleInput(e)} />
            <p className={`formFeedback ${validFirstName ? "hidden" : ""}`}>
              Please enter a first name
          </p>
          </div>
          <div className="formDiv">
            <label htmlFor="lastName" className="formLabel">Last Name: </label >
            <input type="text"
              name="lastName"
              onChange={(e) => handleInput(e)} />
            <p className={`formFeedback ${validLastName ? "hidden" : ""}`}>
              Enter a last name
          </p>
          </div>
          <div className="formDiv">
            <label htmlFor="phone" className="formLabel">Phone Number: </label>
            <input type="text"
              placeholder="XXX-XXX-XXXX"
              name="phone"
              onChange={(e) => handleInput(e)} />
            <p className={`formFeedback ${validPhone ? "hidden" : ""}`}>
              Enter a phone number in the form xxx-xxx-xxxx
          </p>
          </div>
          <div className="formDiv">
            <label htmlFor="email" className="formLabel">NetID: </label >
            <input type="text"
              name="email"
              onChange={(e) => handleInput(e)} />
            <p className={`formFeedback ${validEmail ? "hidden" : ""}`}>
              Enter a valid netid
          </p>
          </div>
          <div className="formDiv">
            <label className="formLabel">Accessibility Needs: </label >
            <div>
              <div className="checkboxDiv">
                <input type="checkbox" id="accesibility" name="needWheel"
                  onChange={(e) => handleInput(e)}
                />
                <label htmlFor="accesibility"> Needs Wheelchair</label>
              </div>
              <div className="checkboxDiv">
                <input type="checkbox" id="accesibility" name="needCrutches"
                  onChange={(e) => handleInput(e)}
                />
                <label htmlFor="accesibility"> Has Crutches</label>
              </div>
              <div className="checkboxDiv">
                <input type="checkbox" id="accesibility" name="needAssist"
                  onChange={(e) => handleInput(e)}
                />
                <label htmlFor="accesibility"> Needs Assistant</label>
              </div>
            </div>
          </div>
          <div className="formDiv">
            <label htmlFor="description" className="formLabel">
              Description:
          </label >
            <input type="text"
              name="description"
              onChange={(e) => handleInput(e)} />
            <p className={`formFeedback ${validDesc ? "hidden" : ""}`}>
              Enter a description
          </p>
          </div>
          <div className="formDiv">
            <label htmlFor="pronouns" className="formLabel">Pronouns: </label >
            <select name="pronouns" onChange={(e) => handleInput(e)}>
              <option value="she">She</option>
              <option value="he">He</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
          <div className="formDiv">
            <label htmlFor="address" className="formLabel">Address: </label >
            <input type="text"
              name="address"
              onChange={(e) => handleInput(e)} />
            <p className={`formFeedback ${validAddress ? "hidden" : ""}`}>
              Enter an address
          </p>
          </div>
          <input type="submit" value="Submit" />
        </form>
      </div>
    </>
  );
};

const Table = () => {
  const [riders, setRiders] = useState([
    {
      firstName: 'first1', lastName: 'last1', phoneNumber: '111-111-1111',
      email: 'a1@cornell.edu', accessibilityNeeds:
        { needsWheelchair: true, hasCrutches: true, needsAssistant: false },
      description: 'descr1', joinDate: 'join1', pronouns: 'pro1', address: 'add1'
    },
    {
      firstName: 'first2', lastName: 'last2', phoneNumber: '222-222-2222',
      email: 'b2@cornell.edu', accessibilityNeeds:
        { needsWheelchair: false, hasCrutches: true, needsAssistant: false },
      description: 'descr2', joinDate: 'join2', pronouns: 'pro2', address: 'add2'
    }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      };
      const response = await fetch('/rider', requestOptions);
      const result = (await response.json())["data"];
      setRiders(result);
    };
  });

  function renderAccessNeeds(accessNeeds: AccessibilityNeeds) {
    let allNeeds = '';
    let arrayNeeds = Object.entries(accessNeeds);
    arrayNeeds.forEach(element => {
      if (element[1]) {
        if (element[0] === 'needsWheelchair') {
          allNeeds = allNeeds.concat("Needs Wheelchair, ");
        } else if (element[0] === 'hasCrutches') {
          allNeeds = allNeeds.concat("Has Crutches, ");
        } else {
          allNeeds = allNeeds.concat("Needs Assistant, ");
        }
      }
    });
    return allNeeds.substr(0, allNeeds.length - 2);
  }

  function renderTableData(allRiders: Rider[]) {
    return allRiders.map((rider, index) => {
      const {
        firstName, lastName, phoneNumber, email,
        accessibilityNeeds,
        description, joinDate, pronouns, address
      } = rider;
      return (
        <tr key={email}>
          <td className="tableCell">{firstName}</td>
          <td>{lastName}</td>
          <td>{phoneNumber}</td>
          <td>{email}</td>
          <td>{renderAccessNeeds(accessibilityNeeds)}</td>
          <td>{description}</td>
          <td>{joinDate}</td>
          <td>{pronouns}</td>
          <td>{address}</td>
          <td>
            <button onClick={() => setRiders(deleteEntry(email, allRiders))}>
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
        <h1 className="formHeader">Rider Table</h1>
        <table className="table">
          <tbody>
            {renderTableHeader()}
            {renderTableData(riders)}
          </tbody>
        </table>
      </div >
      <div>
        <Form onClick={(newRider) => {
          const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              "firstName": newRider["firstName"],
              "lastName": newRider["lastName"],
              "phoneNumber": newRider["phoneNumber"],
              "email": newRider["email"],
              "accessibilityNeeds": {
                "needsWheelchair": newRider["accessibilityNeeds"]["needsWheelchair"],
                "hasCrutches": newRider["accessibilityNeeds"]["hasCrutches"],
                "needsAssistant": newRider["accessibilityNeeds"]["needsAssistant"]
              },
              "description:": newRider["description"],
              "joinDate:": newRider["joinDate"],
              "pronouns:": newRider["pronouns"],
              "address:": newRider["address"]
            })
          };
          const response = fetch('/rider', requestOptions);
          setRiders(addRider(newRider, riders));
        }} />
      </div>
    </>
  );
};

const RiderTable = () => (
  <>
    <SignInButton />
    <Table />
  </>
);

export default RiderTable;
