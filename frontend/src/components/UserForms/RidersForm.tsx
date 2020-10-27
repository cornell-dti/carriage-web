import React, { useState } from 'react';
import { Rider } from '../../types/index';

type FormProps = {
  onClick: ((newRider: Rider) => void);
}

const Form = (props: FormProps) => {
  const today = new Date();
  const date = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  const [newRider, setNewRider] = useState({
    id: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    accessibilityNeeds: new Array<string>(),
    description: '',
    joinDate: date,
    pronouns: 'she/her/hers',
    address: '',
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
    if (fieldName === 'firstName') {
      if (fieldValue.length > 0) {
        newRider.firstName = fieldValue;
        setValidFirstName(true);
      } else {
        newRider.firstName = '';
        setValidFirstName(false);
      }
    } else if (fieldName === 'lastName') {
      if (fieldValue.length > 0) {
        newRider.lastName = fieldValue;
        setValidLastName(true);
      } else {
        newRider.lastName = '';
        setValidLastName(false);
      }
    } else if (fieldName === 'phone') {
      const phoneFormat = /^[0-9]{10}$/;
      if ((fieldValue.length > 0) && fieldValue.match(phoneFormat)) {
        newRider.phoneNumber = fieldValue;
        setValidPhone(true);
      } else {
        newRider.phoneNumber = '';
        setValidPhone(false);
      }
    } else if (fieldName === 'email') {
      const netIdFormat = /^[a-zA-Z]+[0-9]+$/;
      if ((fieldValue.length > 0) && fieldValue.match(netIdFormat)) {
        newRider.email = fieldValue.concat('@cornell.edu');
        setValidEmail(true);
      } else {
        newRider.email = '';
        setValidEmail(false);
      }
    } else if (fieldName === 'description') {
      if (fieldValue.length > 0) {
        newRider.description = fieldValue;
        setValidDesc(true);
      } else {
        newRider.description = '';
        setValidDesc(false);
      }
    } else if (fieldName === 'address') {
      if (fieldValue.length > 0) {
        newRider.address = fieldValue;
        setValidAddress(true);
      } else {
        newRider.address = '';
        setValidAddress(false);
      }
    } else if (fieldName === 'pronouns') {
      newRider.pronouns = fieldValue;
    } else {
      if (fieldName === 'needWheel') {
        newRider.accessibilityNeeds.push('Wheelchair');
      } if (fieldName === 'needCrutches') {
        newRider.accessibilityNeeds.push('Crutches');
      } else if (fieldName === 'needAssist') {
        newRider.accessibilityNeeds.push('Assistant');
      }
    }
    setNewRider(newRider);
  };
  const handleSubmit = (evt: any) => {
    evt.preventDefault();
    const validRider = validFirstName && validLastName && validPhone
      && validEmail && validDesc && validAddress;
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
            <p className={`formFeedback ${validFirstName ? 'hidden' : ''}`}>
              Please enter a first name
          </p>
          </div>
          <div className="formDiv">
            <label htmlFor="lastName" className="formLabel">Last Name: </label >
            <input type="text"
              name="lastName"
              onChange={(e) => handleInput(e)} />
            <p className={`formFeedback ${validLastName ? 'hidden' : ''}`}>
              Enter a last name
          </p>
          </div>
          <div className="formDiv">
            <label htmlFor="phone" className="formLabel">Phone Number: </label>
            <input type="text"
              placeholder="XXXXXXXXXX"
              name="phone"
              onChange={(e) => handleInput(e)} />
            <p className={`formFeedback ${validPhone ? 'hidden' : ''}`}>
              Enter a phone number in the form xxxxxxxxxx
          </p>
          </div>
          <div className="formDiv">
            <label htmlFor="email" className="formLabel">NetID: </label >
            <input type="text"
              name="email"
              onChange={(e) => handleInput(e)} />
            <p className={`formFeedback ${validEmail ? 'hidden' : ''}`}>
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
            <p className={`formFeedback ${validDesc ? 'hidden' : ''}`}>
              Enter a description
          </p>
          </div>
          <div className="formDiv">
            <label htmlFor="pronouns" className="formLabel">Pronouns: </label >
            <select name="pronouns" onChange={(e) => handleInput(e)}>
              <option value="she/her/hers">She/Her/Hers</option>
              <option value="he/him/his">He/Him/His</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
          <div className="formDiv">
            <label htmlFor="address" className="formLabel">Address: </label >
            <input type="text"
              name="address"
              onChange={(e) => handleInput(e)} />
            <p className={`formFeedback ${validAddress ? 'hidden' : ''}`}>
              Enter an address
          </p>
          </div>
          <input type="submit" value="Submit" />
        </form>
      </div>
    </>
  );
};

export default Form;
