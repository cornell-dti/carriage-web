import React, { useState, useMemo } from 'react';
import styles from './searchandfilter.module.css';
import { search_icon, filter, check, down, x } from 'icons/other';

interface FilterOption {
  field: string;
  label: string;
  options: { value: string; label: string }[];
}

interface SearchAndFilterProps<T> {
  items: T[];
  onFilterApply: (filteredItems: T[]) => void;
  searchFields: string[];
  filterOptions: FilterOption[];
}

export default function SearchAndFilter<T extends Record<string, any>>({
  items,
  onFilterApply,
  searchFields,
  filterOptions,
}: SearchAndFilterProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [pendingFilters, setPendingFilters] = useState<
    Record<string, string[]>
  >({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    const searchFilteredItems = items.filter((item) => {
      const matchesSearch = searchFields.some((field) => {
        const value = item[field];
        return String(value)
          .toLowerCase()
          .includes(newSearchTerm.toLowerCase());
      });

      const matchesFilters = Object.entries(filters).every(
        ([field, values]) => {
          const fieldValue = item[field];

          if (Array.isArray(fieldValue)) {
            return values.some((filterValue) =>
              fieldValue.some(
                (itemValue) =>
                  String(itemValue).toLowerCase() ===
                  String(filterValue).toLowerCase()
              )
            );
          }

          if (typeof fieldValue === 'boolean') {
            return values.some(
              (filterValue) => String(fieldValue) === filterValue
            );
          }

          return values.some(
            (filterValue) =>
              String(fieldValue).toLowerCase() ===
              String(filterValue).toLowerCase()
          );
        }
      );

      return matchesSearch && matchesFilters;
    });

    onFilterApply(searchFilteredItems);
  };

  const toggleFilter = (field: string, value: string) => {
    setPendingFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      if (!updatedFilters[field]) {
        updatedFilters[field] = [value];
      } else if (updatedFilters[field].includes(value)) {
        updatedFilters[field] = updatedFilters[field].filter(
          (v) => v !== value
        );
        if (updatedFilters[field].length === 0) {
          delete updatedFilters[field];
        }
      } else {
        updatedFilters[field] = [...updatedFilters[field], value];
      }
      return updatedFilters;
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((acc, curr) => acc + curr.length, 0);
  };

  const clearFilters = () => {
    setPendingFilters({});
    setFilters({});
    setActiveSection(null);

  
    const searchFilteredItems = items.filter((item) => {
      const matchesSearch = searchFields.some((field) => {
        const value = item[field];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });

      return matchesSearch;
    });

    onFilterApply(searchFilteredItems);
  };

  const applyFilters = () => {
    setFilters(pendingFilters);

    const filteredItems = items.filter((item) => {
      const matchesSearch = searchFields.some((field) => {
        const value = item[field];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });

      const matchesFilters = Object.entries(pendingFilters).every(
        ([field, values]) => {
          const fieldValue = item[field];

          if (Array.isArray(fieldValue)) {
            return values.some((filterValue) =>
              fieldValue.some(
                (itemValue) =>
                  String(itemValue).toLowerCase() ===
                  String(filterValue).toLowerCase()
              )
            );
          }

          if (typeof fieldValue === 'boolean') {
            return values.some(
              (filterValue) => String(fieldValue) === filterValue
            );
          }

          return values.some(
            (filterValue) =>
              String(fieldValue).toLowerCase() ===
              String(filterValue).toLowerCase()
          );
        }
      );

      return matchesSearch && matchesFilters;
    });

    onFilterApply(filteredItems);
    setIsFilterOpen(false);
  };

  const clearAll = () => {
    setSearchTerm('');
    setFilters({});
    setPendingFilters({});
    setActiveSection(null);
    onFilterApply(items);
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchInputContainer}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search..."
          className={styles.searchInput}
        />
        <img src={search_icon} alt="search" className={styles.searchIcon} />
      </div>

      <div className={styles.buttonContainer}>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={styles.filterButton}
        >
          <div className={styles.filterIconWrapper}>
            <img src={filter} alt="filter" className={styles.filterIcon} />
            <span className={styles.filterLabel}>Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className={styles.filterCount}>
                {getActiveFilterCount()}
              </span>
            )}
            <img
              src={down}
              alt="expand"
              className={`${styles.chevronIcon} ${
                isFilterOpen ? styles.chevronRotate : ''
              }`}
            />
          </div>
        </button>

        {isFilterOpen && (
          <div className={styles.filterDropdown}>
            <div className={styles.filterHeader}>
              <h3>Filters</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className={styles.closeButton}
              >
                <img src={x} alt="close" className={styles.closeIcon} />
              </button>
            </div>

            <div className={styles.filterSections}>
              {filterOptions.map((option) => (
                <div key={option.field} className={styles.filterSection}>
                  <button
                    className={styles.sectionHeader}
                    onClick={() =>
                      setActiveSection(
                        activeSection === option.field ? null : option.field
                      )
                    }
                  >
                    <span>{option.label}</span>
                    <img
                      src={down}
                      alt="expand"
                      className={`${styles.chevronIcon} ${
                        activeSection === option.field
                          ? styles.chevronRotate
                          : ''
                      }`}
                    />
                  </button>

                  {activeSection === option.field && (
                    <div className={styles.optionsList}>
                      {option.options.map((opt) => (
                        <label
                          key={opt.value}
                          className={styles.optionLabel}
                          onClick={() => toggleFilter(option.field, opt.value)}
                        >
                          <div
                            className={`${styles.checkbox} ${
                              pendingFilters[option.field]?.includes(opt.value)
                                ? styles.checkboxChecked
                                : ''
                            }`}
                          >
                            {pendingFilters[option.field]?.includes(
                              opt.value
                            ) && (
                              <img
                                src={check}
                                alt="selected"
                                className={styles.checkIcon}
                              />
                            )}
                          </div>
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.filterActions}>
              <button
                onClick={clearFilters}
                className={styles.clearFiltersButton}
              >
                Clear Filters
              </button>
              <button onClick={applyFilters} className={styles.applyButton}>
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
