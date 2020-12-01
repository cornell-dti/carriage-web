import React, { useState } from 'react';
import { Dispatcher } from '../../types/index';
import TextInput from './TextInput';
import DropDownInput from './DropDownInput';

type FormProps = {
  onClick: ((newDispatcher: Dispatcher) => void);
}

const Form = (props: FormProps) => {
  const [newDispatcher, setNewDispatcher] = useState({
    id: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    accessLevel: '',
  });
  const [validFirstName, setValidFirstName] = useState(false);
  const [validLastName, setValidLastName] = useState(false);
  const [validPhone, setValidPhone] = useState(false);
  const [validEmail, setValidEmail] = useState(false);
  const [validAccessLvl, setValidAccessLvl] = useState(true);

  const handleInput = (evt: any) => {
    const fieldName = evt.target.name;
    const fieldValue = evt.target.value;
    if (fieldName === 'firstName') {
      if (fieldValue.length > 0) {
        newDispatcher.firstName = fieldValue;
        setValidFirstName(true);
      } else {
        newDispatcher.firstName = '';
        setValidFirstName(false);
      }
    } else if (fieldName === 'lastName') {
      if (fieldValue.length > 0) {
        newDispatcher.lastName = fieldValue;
        setValidLastName(true);
      } else {
        newDispatcher.lastName = '';
        setValidLastName(false);
      }
    } else if (fieldName === 'phone') {
      const phoneFormat = /^[0-9]{10}$/;
      if ((fieldValue.length > 0) && fieldValue.match(phoneFormat)) {
        newDispatcher.phoneNumber = fieldValue;
        setValidPhone(true);
      } else {
        newDispatcher.phoneNumber = '';
        setValidPhone(false);
      }
    } else if (fieldName === 'email') {
      const netIdFormat = /^[a-zA-Z]+[0-9]+$/;
      if ((fieldValue.length > 0) && fieldValue.match(netIdFormat)) {
        newDispatcher.email = fieldValue.concat('@cornell.edu');
        setValidEmail(true);
      } else {
        newDispatcher.email = '';
        setValidEmail(false);
      }
    } else {
      newDispatcher.accessLevel = fieldValue;
    }
    setNewDispatcher(newDispatcher);
  };

  const handleSubmit = (evt: any) => {
    evt.preventDefault();
    const validRider = validFirstName && validLastName && validPhone
      && validEmail && validAccessLvl;
    if (validRider) { props.onClick(newDispatcher); }
  };

  return (
    <>
      <h2 className="formHeader">New Dispatcher</h2>
      <div className="addFormDiv">
        <form className="addForm" onSubmit={(e) => handleSubmit(e)}>
          <TextInput
            labelName="firstName"
            labelText="First Name: "
            feedback="Please enter a first name"
            showFormFeedback={validFirstName}
            handleInput={(e) => handleInput(e)} />
          <TextInput
            labelName="lastName"
            labelText="Last Name: "
            feedback="Please enter a last name"
            showFormFeedback={validLastName}
            handleInput={(e) => handleInput(e)} />
          <TextInput
            labelName="phone"
            labelText="Phone Number: "
            feedback="Enter a phone number in the form xxx-xxx-xxxx"
            showFormFeedback={validPhone}
            handleInput={(e) => handleInput(e)} />
          <TextInput
            labelName="email"
            labelText="NetId: "
            feedback="Enter a valid netid"
            showFormFeedback={validEmail}
            handleInput={(e) => handleInput(e)} />
          <DropDownInput
            labelName="accessLevel"
            labelText="Access Level: "
            options={["Admin", "SDS", "Dispatcher"]}
            handleInput={(e) => handleInput(e)} />
          <input type="submit" value="Submit" />
        </form>
      </div>
    </>
  )

}

export default Form
