import React, { useState, useMemo } from 'react';
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
    <div className="flex items-center gap-2.5 w-full h-full min-h-full">
      <div className="relative grow h-full">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search..."
          className="h-full py-0 pr-3 pl-10 border border-[#d1d5db] rounded text-sm w-full focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.5)]"
        />
        <img
          src={search_icon}
          alt="search"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] w-5 h-5 pointer-events-none"
        />
      </div>

      <div className="relative h-full">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center h-full px-3 cursor-pointer rounded border border-[#d1d5db] transition-all duration-200 bg-white hover:bg-[#f3f4f6]"
        >
          <div className="flex items-center gap-2 h-10 relative">
            <img src={filter} alt="filter" className="w-5 h-5 object-contain" />
            <span className="text-sm text-[#374151] mx-1">Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#3b82f6] text-white rounded-full py-0.5 px-1.5 text-xs min-w-5 text-center">
                {getActiveFilterCount()}
              </span>
            )}
            <img
              src={down}
              alt="expand"
              className={`w-4 h-4 transition-transform duration-200 ${
                isFilterOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {isFilterOpen && (
          <div className="absolute top-[calc(100%+4px)] right-0 w-75 bg-white border border-[#d1d5db] rounded shadow-md z-50 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-[#111827]">
                Filters
              </h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1 border-none bg-transparent rounded cursor-pointer transition-colors duration-200 hover:bg-[#f3f4f6]"
              >
                <img src={x} alt="close" className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4 max-h-100 overflow-y-auto">
              {filterOptions.map((option) => (
                <div
                  key={option.field}
                  className="border-b border-[#e5e7eb] pb-4 last:border-b-0"
                >
                  <button
                    className="w-full flex justify-between items-center py-2 bg-transparent border-none font-medium text-[#374151] cursor-pointer transition-colors duration-200 hover:text-[#111827]"
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
                      className={`w-4 h-4 transition-transform duration-200 ${
                        activeSection === option.field ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {activeSection === option.field && (
                    <div className="flex flex-col gap-2 mt-2">
                      {option.options.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors duration-200 text-[#4b5563] text-sm hover:bg-[#f3f4f6]"
                          onClick={() => toggleFilter(option.field, opt.value)}
                        >
                          <div
                            className={`w-4 h-4 border border-[#d1d5db] rounded flex items-center justify-center transition-all duration-200 ${
                              pendingFilters[option.field]?.includes(opt.value)
                                ? 'bg-[#3b82f6] border-[#3b82f6]'
                                : 'bg-white'
                            }`}
                          >
                            {pendingFilters[option.field]?.includes(
                              opt.value
                            ) && (
                              <img
                                src={check}
                                alt="selected"
                                className="w-3 h-3 text-white"
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

            <div className="flex gap-2 mt-4 pt-4 border-t border-[#e5e7eb]">
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-[#d1d5db] bg-white text-[#4b5563] rounded text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#f3f4f6] hover:border-[#9ca3af]"
              >
                Clear Filters
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-2 bg-[#3b82f6] text-white border-none rounded text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-[#2563eb]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
