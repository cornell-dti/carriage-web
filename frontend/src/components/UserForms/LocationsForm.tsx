import React, { useState } from 'react';
import cn from 'classnames';
import styles from '../UserTables/table.module.css';
import { Location } from '../../types/index';

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
          <div className={styles.formDiv}>
            <label htmlFor="name" className={styles.formLabel}>
              Name:{' '}
            </label>
            <input type="text" name="name" onChange={handleInput} />
            <p
              className={cn(styles.formFeedback, {
                [styles.hidden2]: validName,
              })}
            >
              Enter a name
            </p>
          </div>
          <div className={styles.formDiv}>
            <label htmlFor="address" className={styles.formLabel}>
              Address:{' '}
            </label>
            <input type="text" name="address" onChange={handleInput} />
            <p
              className={cn(styles.formFeedback, {
                [styles.hidden2]: validAddress,
              })}
            >
              Enter an address
            </p>
          </div>
          <div className={styles.formDiv}>
            <label htmlFor="tag" className={styles.formLabel}>
              Tag:{' '}
            </label>
            <select name="tag" onChange={handleInput}>
              <option value="none">no tag</option>
              <option value="west">west campus</option>
              <option value="central">central campus</option>
              <option value="north">north campus</option>
              <option value="ctown">college down</option>
              <option value="dtown">downtown</option>
            </select>
            <p> &nbsp;(optional)</p>
          </div>
          <input type="submit" value="Submit" />
        </form>
      </div>
    </div>
  );
};

export default Form;
