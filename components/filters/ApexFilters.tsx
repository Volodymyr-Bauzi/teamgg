// app/components/filters/ApexFilters.tsx
'use client';

import {useState} from 'react';
import styles from '../../styles/Filters.module.css';

const ranks = [
  'Rookie',
  'Bronze',
  'Silver',
  'Gold',
  'Diamond',
  'Master',
  'Apex Predator',
];

const ApexFilters = () => {
  const [selectedRank, setSelectedRank] = useState<string>('');

  return (
    <div className={styles.filterBox}>
      <h3>Filter by Rank</h3>
      <select
        value={selectedRank}
        onChange={(e) => setSelectedRank(e.target.value)}
      >
        <option value="">Any</option>
        {ranks.map((rank) => (
          <option key={rank} value={rank}>
            {rank}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ApexFilters;
