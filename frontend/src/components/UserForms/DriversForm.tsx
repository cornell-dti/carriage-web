import React, { useState } from 'react';
import TextInput from './TextInput';

type Driver = {
  name: string,
  netid: string,
  email: string,
  phone: string,
}

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
          <TextInput
            labelName="name"
            labelText="Name: "
            feedback="Please enter a name"
            showFormFeedback={`formFeedback ${validName ? 'hidden' : ''}`}
            handleInput={(e) => handleInput(e)} />
          <TextInput
            labelName="netid"
            labelText="NetID: "
            feedback="Enter a valid netid"
            showFormFeedback={`formFeedback ${validEmail ? 'hidden' : ''}`}
            handleInput={(e) => handleInput(e)} />
          <TextInput
            labelName="email"
            labelText="Email: "
            feedback="Enter a valid email address"
            showFormFeedback={`formFeedback ${validEmail ? 'hidden' : ''}`}
            handleInput={(e) => handleInput(e)} />
          <TextInput
            labelName="phone"
            labelText="Phone Number: "
            feedback="Enter a phone number in the form xxx-xxx-xxxx"
            showFormFeedback={`formFeedback ${validPhone ? 'hidden' : ''}`}
            handleInput={(e) => handleInput(e)} />
          <input type="submit" value="Submit" />
        </form>
      </div>
    </>
  );
};

export default Form;
