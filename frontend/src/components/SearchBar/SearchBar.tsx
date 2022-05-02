import React, { useState } from 'react';
import styles from './searchbar.module.css';
import { search_icon } from '../../icons/other/index';

type SearchBarProps = {
  enteredName: string;
  setEnteredName: React.Dispatch<React.SetStateAction<string>>;
};

const SearchBar = ({ enteredName, setEnteredName }: SearchBarProps) => {
  return (
    <div className={styles.search}>
      <div className={styles.searchIcon}>
        <img alt="trash" src={search_icon} />
      </div>
      <div className={styles.searchInputs}>
        <input
          type="text"
          placeholder="Search for students..."
          onChange={(e) => setEnteredName(e.target.value)}
          value={enteredName}
        />
      </div>
    </div>
  );
};

export default SearchBar;
