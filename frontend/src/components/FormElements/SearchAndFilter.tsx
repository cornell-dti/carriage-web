import React, { useState, useMemo } from 'react';
import styles from './searchandfilter.module.css';

interface FilterOption {
  field: string;
  label: string;
  options: { value: string, label: string }[];
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFilterOption, setOpenFilterOption] = useState<string | null>(null);

  // Log the search term whenever it changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    console.log('Search term:', e.target.value);
  };

  // Log when a filter is toggled and what filters are active
  const toggleFilter = (field: string, value: string) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters };
      if (!updatedFilters[field]) {
        updatedFilters[field] = [value];
      } else if (updatedFilters[field].includes(value)) {
        updatedFilters[field] = updatedFilters[field].filter(v => v !== value);
        if (updatedFilters[field].length === 0) {
          delete updatedFilters[field];
        }
      } else {
        updatedFilters[field] = [...updatedFilters[field], value];
      }
      console.log('Filters applied:', updatedFilters);
      return updatedFilters;
    });
  };

  const toggleFilterOption = (field: string) => {
    setOpenFilterOption(prevOpen => (prevOpen === field ? null : field));
  };

  // Log the filtered items after applying search and filters
  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      const matchesSearch = searchFields.some((field) => {
        const value = item[field];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });

      const matchesFilters = Object.entries(filters).every(([field, values]) => {
        const fieldValue = item[field];
        return values.some(filterValue =>
          String(fieldValue).toLowerCase().includes(filterValue.toLowerCase())
        );
      });

      return matchesSearch && matchesFilters;
    });

    console.log('Filtered items:', filtered);
    return filtered;
  }, [items, searchTerm, filters, searchFields]);

  // Log when the apply button is clicked and what filtered items are sent to the parent
  const applyFilters = () => {
    console.log('Applying filters with the following items:', filteredItems);
    onFilterApply(filteredItems);
    setIsFilterOpen(false);
  };

  const clearAllFilters = () => {
    setFilters({});
    console.log('Cleared all filters');
  };

  const clearAll = () => {
    setFilters({});
    setSearchTerm('');
    console.log('Cleared all filters and search');
    onFilterApply(items);
    setIsFilterOpen(false);
    setOpenFilterOption(null);
  };

  return (
    <div className={styles.container}>
      {/* Search Bar */}
      <div className={styles.searchInputContainer}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
      </div>

      {/* Filter Button */}
      <div className={styles.buttonContainer}>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={styles.button}
        >
          {/* Generic SVG for Filter */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 5H17M5 10H15M7 15H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {isFilterOpen && (
          <div className={styles.filterDropdown}>
            <h3 className={styles.filterHeader}>Filters</h3>
            <div>
              {filterOptions.map((option) => (
                <div key={option.field} className={styles.filterOption}>
                  <button
                    className={styles.filterHeader}
                    onClick={() => toggleFilterOption(option.field)}
                  >
                    {option.label}
                  </button>
                  {openFilterOption === option.field && (
                    <div className={styles.filterOptions}>
                      {option.options.map((opt) => (
                        <button
                          key={opt.value}
                          className={styles.button}
                          onClick={() => toggleFilter(option.field, opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button onClick={clearAllFilters} className={styles.clearFiltersButton}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Reset & Apply Buttons */}
      <button onClick={clearAll} className={styles.resetButton}>
        Reset
      </button>
      <button onClick={applyFilters} className={styles.applyButton}>
        Apply
      </button>
    </div>
  );
}
