'use client';

import React, {createContext, useContext, useState} from 'react';

type Filters = Record<string, string>;

const FilterContext = createContext<{
  filters: Filters;
  setFilters: (filters: Filters) => void;
}>({
  filters: {},
  setFilters: () => {},
});

export const useFilterContext = () => useContext(FilterContext);

export const FilterProvider = ({children}: {children: React.ReactNode}) => {
  const [filters, setFilters] = useState<Filters>({});
  return (
    <FilterContext.Provider value={{filters, setFilters}}>
      {children}
    </FilterContext.Provider>
  );
};
