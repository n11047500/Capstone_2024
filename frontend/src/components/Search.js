import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './Search.css';

const Search = async () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    const handleSearch = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/search?query=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const contentType = response.headers.get('Content-Type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Unexpected response format');
            }
    
            const data = await response.json();  // Await the JSON response here
            console.log('Data received from backend:', data); // Log the data to check if it's a valid array

            setResults(data);  // Now you can set the data properly in the state
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
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
                    <path d="M11.742 10.742a5.5 5.5 0 1 0-1.436 1.436l4.536 4.536a1 1 0 0 0 1.415-1.414l-4.536-4.536zM12.5 5.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0z"/>
                </svg>
            </div>
        </div>
    );
};

export default Search;
