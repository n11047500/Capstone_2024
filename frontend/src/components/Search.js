import React, { useState } from 'react';
import './Search.css';

const Search = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query);  // Pass the search query to the Browse component
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <div className="search-icon" onClick={handleSearch}>
        <svg width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
          <path d="M11.742 10.742a5.5 5.5 0 1 0-1.436 1.436l4.536 4.536a1 1 0 0 0 1.415-1.414l-4.536-4.536zM12.5 5.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0z" />
        </svg>
      </div>
    </div>
  );
};

export default Search;
