import React from 'react';
import { Search } from 'lucide-react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  value,
  onChange,
  resultCount,
}) => {
  return (
    <div className={styles.searchBar}>
      <Search size={20} className={styles.searchIcon} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.searchInput}
      />
      {resultCount !== undefined && (
        <span className={styles.resultCount}>{resultCount} results</span>
      )}
    </div>
  );
};

export default SearchBar;