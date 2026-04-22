import React, { useState, ChangeEventHandler } from 'react';
import { search_icon } from '../../icons/other/index';

type SearchBarProps = {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
};

const SearchBar = ({ value, onChange, placeholder }: SearchBarProps) => {
  return (
    <div className="w-233.25 h-10 ml-8 bg-white border border-black rounded-[10px] flex flex-row">
      <div className="mt-[0.4rem] ml-4">
        <img alt="search-icon" src={search_icon} />
      </div>
      <div className="mt-[0.4rem] border-0 ml-4">
        <input
          type="text"
          className="border-0 font-semibold text-xl leading-6 w-212.5"
          placeholder={placeholder}
          onChange={onChange}
          value={value}
        />
      </div>
    </div>
  );
};

export default SearchBar;
