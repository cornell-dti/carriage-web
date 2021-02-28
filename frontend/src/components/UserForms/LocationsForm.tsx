import React, { useState } from 'react';
import styles from '../UserTables/table.module.css';
import { Location } from '../../types/index';
import TextInput from './TextInput';
import DropDownInput from './DropDownInput';

type FormProps = {
  onClick: (newLocation: Location) => void;
};

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
    } else if (fieldName === 'tag') {
      if (fieldValue === 'none') {
        delete updatedLocation.tag;
      } else {
        updatedLocation.tag = fieldValue;
      }
    }
    setNewLocation(updatedLocation);
  };

  const handleSubmit = (evt: any) => {
    evt.preventDefault();
    if (validName && validAddress) {
      onClick(newLocation);
    }
  };

  return (
    <div>
      <h2 className={styles.formHeader}>New Location</h2>
      <div className={styles.addFormDiv}>
        <form className={styles.addForm} onSubmit={handleSubmit}>
          <TextInput
            labelName="name"
            labelText="Name: "
            feedback="Please enter a name"
            showFormFeedback={validName}
            handleInput={(e) => handleInput(e)}
          />
          <TextInput
            labelName="address"
            labelText="Address: "
            feedback="Please enter an address"
            showFormFeedback={validAddress}
            handleInput={(e) => handleInput(e)}
          />
          <DropDownInput
            labelName="tag"
            labelText="Tag: "
            options={['none', 'west', 'central', 'north', 'ctown', 'dtown']}
            handleInput={(e) => handleInput(e)}
          />
          <input type="submit" value="Submit" />
        </form>
      </div>
    </div>
  );
};

export default Form;
