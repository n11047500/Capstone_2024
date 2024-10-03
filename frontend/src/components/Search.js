import React, { useState } from 'react';
import './Search.css';
import search_symbol from '../assets/search_symbol.png'; // Ensure correct path and file name


const Search = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {  // Check if the query is not just whitespace
      onSearch(query);  // Pass the search query to the Browse component
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();  // Call handleSearch when Enter is pressed
    }
  };

  return (
    <div className="search-container">
      <input
        className="search-input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Search..."
      />
      <button className="search-icon" onClick={handleSearch}>
        <img src={search_symbol} alt="Search" className="search-image" />
      </button>
    </div>
  );
};

export default Search;
