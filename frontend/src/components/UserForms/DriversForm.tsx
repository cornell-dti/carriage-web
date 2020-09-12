import React, { useState } from 'react';
import { Driver } from '../../types/index';

type FormProps = {
  onClick: ((newDriver: Driver) => void);
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
        newDriver.name = '';
        setValidName(false);
      }
    } else if (fieldName === 'netid') {
      const netIdFormat = /^[a-zA-Z]+[0-9]+$/;
      if ((fieldValue.length > 0) && fieldValue.match(netIdFormat)) {
        newDriver.netid = fieldValue;
        setValidNetid(true);
      } else {
        newDriver.netid = '';
        setValidNetid(false);
      }
    } else if (fieldName === 'email') {
      const emailFormat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if ((fieldValue.length > 0) && fieldValue.match(emailFormat)) {
        newDriver.email = fieldValue;
        setValidEmail(true);
      } else {
        newDriver.email = '';
        setValidEmail(false);
      }
    } else {
      const phoneFormat = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
      if ((fieldValue.length > 0) && fieldValue.match(phoneFormat)) {
        newDriver.phone = fieldValue;
        setValidPhone(true);
      } else {
        newDriver.phone = '';
        setValidPhone(false);
      }
    }
    setNewDriver(newDriver);
  };
  const handleSubmit = (evt: any) => {
    evt.preventDefault();
    const validAddDriver = validName && validNetid && validEmail && validPhone;
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
            <p className={`formFeedback ${validName ? 'hidden' : ''}`}>
              Enter a name
          </p>
          </div>
          <div className="formDiv">
            <label htmlFor="netid" className="formLabel">NetID: </label>
            <input type="text"
              name="netid"
              onChange={(e) => handleInput(e)}
            />
            <p className={`formFeedback ${validNetid ? 'hidden' : ''}`}>
              Enter a valid netid
          </p>
          </div>
          <div className="formDiv">
            <label htmlFor="email" className="formLabel">Email: </label>
            <input type="text"
              name="email"
              onChange={(e) => handleInput(e)}
            />
            <p className={`formFeedback ${validEmail ? 'hidden' : ''}`}>
              Enter a valid email address
          </p>
          </div>
          <div className="formDiv">
            <label htmlFor="phone" className="formLabel">Phone Number: </label>
            <input type="text"
              name="phone"
              placeholder="XXX-XXX-XXXX"
              onChange={(e) => handleInput(e)}
            />
            <p className={`formFeedback ${validPhone ? 'hidden' : ''}`}>
              Enter a phone number in the form xxx-xxx-xxxx
          </p>
          </div>
          <input type="submit" value="Submit" />
        </form>
      </div>
    </>
  );
};

export default Form;
