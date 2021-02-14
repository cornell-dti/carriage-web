import React from 'react';
import styles from '../UserTables/table.module.css';

type InputProp = {
  labelText: string;
  checkboxId: string;
  options: string[];
  optionLabels: string[];
  handleInput: (e: any) => void;
};

type checkboxProp = {
  checkboxId: string;
  checkboxName: string;
  checkboxLabel: string;
  handleInput: (e: any) => void;
};

const renderCheckbox = ({
  checkboxId,
  checkboxName,
  checkboxLabel,
  handleInput,
}: checkboxProp) => (
  <div className={styles.checkboxDiv}>
    <input
      type="checkbox"
      id={checkboxId}
      name={checkboxName}
      onChange={(e) => handleInput(e)}
    />
    <label htmlFor={checkboxId}> {checkboxLabel} </label>
  </div>
);

const CheckBoxInput = ({
  labelText,
  checkboxId,
  options,
  optionLabels,
  handleInput,
}: InputProp) => (
  <div className={styles.formDiv}>
    <label className={styles.formLabel}> {labelText} </label>
    <div>
      {options.map((opt: string, i) => renderCheckbox({
        checkboxId: opt,
        checkboxName: checkboxId,
        checkboxLabel: optionLabels[i] || '',
        handleInput,
      }))}
    </div>
  </div>
);

export default CheckBoxInput;
