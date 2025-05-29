'use client';

import {useEffect} from 'react';
import {gameFilterConfig} from '../../app/utils/gameFilterConfig';
import styles from '../../styles/Filters.module.css';
import {useFilterContext} from '@/app/context/FilterContext';

export default function FilterForm({gameId}: {gameId: string}) {
  const {filters, setFilters} = useFilterContext();

  const config = gameFilterConfig[gameId];
  if (!config) return <p>Unknown game</p>;

  const handleChange = (key: string, value: string) => {
    setFilters({...filters, [key]: value});
  };

  useEffect(() => {
    console.log('Current filter state:', filters);
    // pass to parent/filtering logic
  }, [filters]);

  return (
    <form className={styles.filterBox}>
      <h3>{config.label} Filters</h3>
      {config.fields.map((field) => (
        <div key={field.key} className={styles.formGroup}>
          <label>{field.label}</label>
          {field.type === 'select' ? (
            <select onChange={(e) => handleChange(field.key, e.target.value)}>
              <option value="">{field.optional ? 'Any' : 'Select one'}</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.optional ? '(optional)' : ''}
            />
          )}
        </div>
      ))}
    </form>
  );
}
