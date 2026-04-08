import React, { useState, ChangeEventHandler } from 'react';
import styles from './searchbar.module.css';
import { search_icon } from '../../icons/other/index';

type SearchBarProps = {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
};

const SearchBar = ({ value, onChange, placeholder }: SearchBarProps) => {
  return (
    <div className={styles.search}>
      <div className={styles.searchIcon}>
        <img alt="search-icon" src={search_icon} />
      </div>
      <div className={styles.searchInputs}>
        <input
          type="text"
          className={styles.searchBar}
          placeholder={placeholder}
          onChange={onChange}
          value={value}
        />
      </div>
    </div>
  );
};

export default SearchBar;
