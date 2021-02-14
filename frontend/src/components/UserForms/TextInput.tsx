import React from 'react';
import styles from '../UserTables/table.module.css';

type InputProp = {
  labelName: string;
  labelText: string;
  feedback: string;
  showFormFeedback: boolean;
  handleInput: ((e: any) => void);
}

const TextInput = (
  { labelName, labelText, feedback, showFormFeedback, handleInput }: InputProp,
) => (
    <div className={styles.formDiv}>
      <label htmlFor={labelName} className={styles.formLabel}>
        {labelText}
      </label >
      <input type="text"
        name={labelName}
        onChange={(e) => handleInput(e)} />
      {showFormFeedback
        && <p>{feedback}</p>
      }
    </div>
);

export default TextInput;
