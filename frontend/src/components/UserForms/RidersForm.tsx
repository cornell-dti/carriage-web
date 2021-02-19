import React, { useState } from 'react';
import { Rider } from '../../types/index';
import TextInput from './TextInput';
import DropDownInput from './DropDownInput';
import CheckBoxInput from './CheckBoxInput';

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
          <CheckBoxInput
            labelText="Accessibility Needs: "
            checkboxId="accessibility"
            options={["needWheel", "needCrutches", "needAssist"]}
            optionLabels={["Needs Wheelchair", "Has Crutches", "Needs Assistant"]}
            handleInput={handleInput}
          />
          <TextInput
            labelName="description"
            labelText="Description: "
            feedback="Enter a description"
            showFormFeedback={validDesc}
            handleInput={(e) => handleInput(e)} />
          <DropDownInput
            labelName="pronouns"
            labelText="Pronouns: "
            options={["she/her/hers", "he/him/his", "neutral"]}
            handleInput={(e) => handleInput(e)} />
          <TextInput
            labelName="address"
            labelText="Address: "
            feedback="Enter an address"
            showFormFeedback={validAddress}
            handleInput={(e) => handleInput(e)} />
          <input type="submit" value="Submit" />
        </form>
      </div>
    </>
  );
};

export default Form;
