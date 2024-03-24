import React, { useState } from 'react';
import './Multiselectbox.css';
import { upArrow, downArrow } from '../../icons/other';

type MultiselectBoxProps = {
  placeHolderText: string;
  dataSource: Array<string>;
  isOpen: boolean;
  optionWithTextInputBox?: string;
  placeHolderTextInputBox?: string;
};

const MultiselectBox = ({
  placeHolderText,
  dataSource,
  isOpen,
  optionWithTextInputBox,
  placeHolderTextInputBox,
}: MultiselectBoxProps) => {
  const [isDropdownBoxOpen, setIsDropdownBoxOpen] = useState(isOpen);
  const [selectedItems, setSelectedItems] = useState(new Set<string>());
  const [inputValue, setInputValue] = useState('');
  const toggleDropdownBox = () => {
    setIsDropdownBoxOpen(!isDropdownBoxOpen);
  };

  const toggleSelectItem = (itemName: string) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemName)) {
      newSelectedItems.delete(itemName);
    } else {
      newSelectedItems.add(itemName);
    }
    setSelectedItems(newSelectedItems);
  };

  return (
    <div className="dropdown-wrapper">
      <button
        type="button"
        className="dropdown-header"
        onClick={toggleDropdownBox}
      >
        <div className="dropdown-header-contents">
          <span>
            {placeHolderText} &nbsp;&nbsp;&nbsp;&nbsp;{' '}
            {isDropdownBoxOpen ? (
              <img src={upArrow} alt="Up Arrow" />
            ) : (
              <img src={downArrow} alt="Down Arrow" />
            )}
          </span>
        </div>
      </button>

      {isDropdownBoxOpen && (
        <>
          <div className="dropdown-list">
            {dataSource.map((itemName) => (
              <div key={itemName}>
                <input
                  type="checkbox"
                  className={'item-checkbox'}
                  id={itemName}
                  name={itemName}
                  onChange={() => toggleSelectItem(itemName)}
                  checked={selectedItems.has(itemName)}
                ></input>
                <label htmlFor={itemName} className={'item-name'}>
                  {itemName}
                </label>
              </div>
            ))}
            {(optionWithTextInputBox
              ? selectedItems.has(optionWithTextInputBox)
              : false) && (
              <input
                type="text"
                className="dropdown-text-input"
                value={inputValue}
                onChange={(newInputValue) => {
                  setInputValue(newInputValue.target.value);
                }}
                placeholder={
                  placeHolderTextInputBox ? placeHolderTextInputBox : ''
                }
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MultiselectBox;
