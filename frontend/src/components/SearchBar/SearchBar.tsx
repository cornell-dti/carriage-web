import React, { useState, ChangeEventHandler } from 'react';
import { search_icon } from '../../icons/other/index';

type SearchBarProps = {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
};

const SearchBar = ({ value, onChange, placeholder }: SearchBarProps) => {
  return (
    <div className="w-[933px] h-10 ml-8 bg-white border border-black rounded-lg flex flex-row">
      <div className="mt-1.5 ml-4">
        <img alt="search-icon" src={search_icon} />
      </div>
      <div className="mt-1.5 ml-4 border-0">
        <input
          type="text"
          className="border-0 font-semibold text-xl leading-6 w-[850px]"
          placeholder={placeholder}
          onChange={onChange}
          value={value}
        />
      </div>
    </div>
  );
};

export default SearchBar;
