import React, { useState, useEffect } from 'react';
import '../styles/table.css';
import SignInButton from './signin'

interface AccessibilityNeeds {
  hasCrutches: boolean;
  needsAssistant: boolean;
  needsWheelchair: boolean;
}

interface Rider {
  id: string;
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

function renderAccessNeeds(accessNeeds: AccessibilityNeeds) {
  let allNeeds = '';
  let arrayNeeds = Object.entries(accessNeeds);
  arrayNeeds.forEach(element => {
    console.log(element[1]);
    if (element[0] == 'hasCrutches' && element[1]) {
      allNeeds = allNeeds.concat("Has Crutches, ");
    } else if (element[0] == 'needsAssistant' && element[1]) {
      allNeeds = allNeeds.concat("Needs Assistant, ");
    }
    else if (element[0] == 'needsWheelchair' && element[1]) {
      allNeeds = allNeeds.concat("Needs Wheelchair, ");
    }
  });
  return allNeeds.substr(0, allNeeds.length - 2);
}

const Form = (props: FormProps) => {
  let today = new Date();
  let date = (today.getMonth() + 1) + "/" + today.getDate() + "/" +
    today.getFullYear();
  const [newRider, setNewRider] =
    useState({
      id: "", firstName: '', lastName: '', phoneNumber: '', email: '',
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
      const phoneFormat = /^[0-9]{10}$/;
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
      } else if (fieldName === "needAssist") {
        newRider.accessibilityNeeds.needsAssistant = true
      }
    }
    setNewRider(newRider);
  };
  const handleSubmit = (evt: any) => {
    // console.log(newRider)
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
              placeholder="XXXXXXXXXX"
              name="phone"
              onChange={(e) => handleInput(e)} />
            <p className={`formFeedback ${validPhone ? "hidden" : ""}`}>
              Enter a phone number in the form xxxxxxxxxx
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
  const [riders, setRiders] = useState(
    [
      {
        id: "", firstName: '', lastName: '', phoneNumber: '',
        email: '', accessibilityNeeds:
          { needsWheelchair: false, hasCrutches: false, needsAssistant: false },
        description: '', joinDate: '', pronouns: '', address: ''
      }
    ]
  );

  useEffect(() => {
    async function getExistingRiders() {
      const response = await fetch('/riders');
      const data = (await response.json())["data"];
      let all_riders: Rider[] = data.map(function (rider: any) {
        return {
          id: rider["id"],
          firstName: rider["firstName"],
          lastName: rider["lastName"],
          phoneNumber: rider["phoneNumber"],
          email: rider["email"],
          accessibilityNeeds: rider["accessibilityNeeds"],
          description: rider["description"],
          joinDate: rider["joinDate"],
          pronouns: rider["pronouns"],
          address: rider["address"]
        }
      });
      setRiders(all_riders);
    }
    getExistingRiders();
  }, []);

  function deleteEntry(email: string, riderList: Rider[]) {
    const riderId = (riderList.filter(rider => rider.email === email))[0]["id"]
    async function deleteBackend() {
      const requestOptions = {
        method: 'DELETE',
        headers: { "Content-Type": 'application/json' },
      };
      const response = await fetch('/riders/' + riderId, requestOptions);
    }
    deleteBackend();
    return riderList.filter(rider => rider.email !== email)
  }

  function addRider(newRider: Rider, allRiders: Rider[]) {
    async function addBackend() {
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
      const response = await fetch('/riders', requestOptions);
    }
    addBackend();
    return [...allRiders, newRider];
  }

  function renderTableData(allRiders: Rider[]) {
    return allRiders.map((rider, index) => {
      const {
        id, firstName, lastName, phoneNumber, email,
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
            <button onClick={() => setRiders(deleteEntry(email, allRiders))
            }>
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
        <Form onClick={(newRider) => (setRiders(addRider(newRider, riders)))} />
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
