import React, { useState } from 'react';
import { Location } from '../../types/index';

type FormProps = {
  onClick: ((newLocation: Location) => void);
}

const Form = ({ onClick }: FormProps) => {
  const [newLocation, setNewLocation] = useState<Location>({
    id: '',
    name: '',
    address: '',
  });
  const [validName, setValidName] = useState(false);
  const [validAddress, setValidAddress] = useState(false);

  const handleInput = (evt: any) => {
    const fieldName = evt.target.name;
    const fieldValue = evt.target.value;
    const updatedLocation = { ...newLocation };
    if (fieldName === 'name') {
      updatedLocation.name = fieldValue;
      setValidName(fieldValue.length > 0);
    } else if (fieldName === 'address') {
      updatedLocation.address = fieldValue;
      setValidAddress(fieldValue.length > 0);
    }
    setNewLocation(updatedLocation);
  };

  const handleSubmit = (evt: any) => {
    evt.preventDefault();
    if (validName && validAddress) { onClick(newLocation); }
  };

  return (
    <div>
      <h2 className="formHeader">New Location</h2>
      <div className="addFormDiv">
        <form className="addForm" onSubmit={handleSubmit}>
          <div className="formDiv">
            <label htmlFor="name" className="formLabel">Name: </label >
            <input
              type="text"
              name="name"
              onChange={handleInput}
            />
            <p className={`formFeedback ${validName && 'hidden2'}`}>
              Enter a name
            </p>
          </div>
          <div className="formDiv">
            <label htmlFor="address" className="formLabel">Address: </label >
            <input
              type="text"
              name="address"
              onChange={handleInput}
            />
            <p className={`formFeedback ${validAddress && 'hidden2'}`}>
              Enter an address
            </p>
          </div>
          <input type="submit" value="Submit" />
        </form>
      </div>
    </div>
  );
};

export default Form;
