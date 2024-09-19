import React, { useState } from 'react';
import './Search.css';
import search_symbol from '../assets/search_symbol.png'; // Ensure correct path and file name

const Search = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query);  // Pass the search query to the Browse component
  };

  return (
    <div className="search-container">
      <input
        className="search-input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <button className="search-icon" onClick={handleSearch}>
        <img src={search_symbol} alt="Search" className="search-image" />
      </button>
    </div>
  );
};

export default Search;