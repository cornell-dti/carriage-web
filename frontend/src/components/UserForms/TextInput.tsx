import React from 'react';
import styles from '../UserTables/table.module.css';

type InputProp = {
  labelName: string,
  labelText: string,
  feedback: string,
  showFormFeedback: string,
  handleInput: ((e: any) => void)
}

const TextInput = (
  { labelName, labelText, feedback, showFormFeedback, handleInput }: InputProp
) => {
  return (
    <div className={styles.formDiv}>
      <label htmlFor={labelName} className={styles.formLabel}>
        {labelText}
      </label >
      <input type="text"
        name={labelName}
        onChange={(e) => handleInput(e)} />
      <p className={showFormFeedback}>
        {feedback}
      </p>
    </div>
  )
}

export default TextInput
