import React, { useState } from 'react';
import './DropdownBox.css';

type DropdownBoxProps = {
  placeHolderText: string;
  dataSource: Array<string>;
  isOpen: boolean;
  confirmText: string;
};

const DropdownBox = ({
  placeHolderText,
  dataSource,
  isOpen,
  confirmText,
}: DropdownBoxProps) => {
  const [isDropdownBoxOpen, setIsDropdownBoxOpen] = useState(isOpen);
  const [selectedItems, setSelectedItems] = useState(new Set<string>());

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
          {placeHolderText}
          {'      '}
          {isDropdownBoxOpen ? '⇈' : '⇊'}
        </div>
      </button>

      {isDropdownBoxOpen && (
        <>
          <div className="dropdown-list">
            {dataSource.map((itemName) => (
              <div
                key={itemName}
                className={`dropdown-list-item ${
                  selectedItems.has(itemName) ? 'item-selected' : ''
                }`}
                onClick={() => toggleSelectItem(itemName)}
              >
                <div
                  className={`item-checkbox ${
                    selectedItems.has(itemName) ? 'item-checkbox-selected' : ''
                  }`}
                />
                <div className="item-name">{itemName}</div>
              </div>
            ))}
            <button
              type="button"
              className="dropdown-list-confirm"
              onClick={toggleDropdownBox}
            >
              {confirmText}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DropdownBox;
