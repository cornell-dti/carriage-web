import React from 'react';
import styles from '../UserTables/table.module.css';

type InputProp = {
  labelName: string,
  labelText: string,
  options: string[],
  handleInput: ((e: any) => void)
}

const DropDownInput = ({ labelName, labelText, options, handleInput }: InputProp) => {
  return (
    <div className={styles.formDiv}>
      <label htmlFor={labelName} className={styles.formLabel}> {labelText} </label >
      <select name={labelName} onChange={(e) => handleInput(e)} defaultValue={options[0]}>
        {options.map((opt: string, i) => (
          <option value={opt} key={i}> {opt} </option>
        ))}
      </select>
    </div>
  )
}

export default DropDownInput
