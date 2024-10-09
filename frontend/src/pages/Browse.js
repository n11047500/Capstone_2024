import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import Search from '../components/Search';
import './Browse.css';
import defaultImage from '../assets/default_image.gif';

function Browse() {
  // State variables for managing products, sorting, search results, and search query
  const [products, setProducts] = useState([]);
  const [sortType, setSortType] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState('');

  // Fetch products from the API
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/products`)
      .then(response => response.json())
      .then(data => {
        setProducts(data);
      })
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  // Handle search functionality
  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery);

    if (searchQuery) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/search?query=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    } else {
      setSearchResults([]);  // Clear search results if the search query is empty
    }
  };

  // Sort products based on the selected sort type
  const sortedProducts = (query && searchResults.length > 0 ? searchResults : products).sort((a, b) => {
    switch (sortType) {
      case 'priceDesc':
        return parseFloat(b.Product_Price) - parseFloat(a.Product_Price);
      case 'priceAsc':
        return parseFloat(a.Product_Price) - parseFloat(b.Product_Price);
      case 'nameAsc':
        return a.Product_Name.localeCompare(b.Product_Name);
      case 'nameDesc':
        return b.Product_Name.localeCompare(a.Product_Name);
      default:
        return 0;  // Default to no sorting
    }
  });

  return (
    <div className="browse-page">
      <Header />
      <div className="browse-header-bar">
        <div className="browse-search-container">
          {/* Search component for handling user search input */}
          <Search onSearch={handleSearch} />
        </div>

        <div className="browse-sort-container">
          {/* Dropdown for sorting products */}
          <select className="browse-sort-dropdown" value={sortType} onChange={e => setSortType(e.target.value)}>
            <option value="">Featured</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="nameAsc">Name: A-Z</option>
            <option value="nameDesc">Name: Z-A</option>
          </select>
        </div>
      </div>
      <div className="browse-product-container">
        {/* Mapping over sorted products to render components in the Product Card */}
        {sortedProducts.map(product => (
          <ProductCard
            key={product.Product_ID}
            productId={product.Product_ID}
            title={product.Product_Name}
            price={`$${product.Product_Price}`}
            image={product.Product_Image_URL || defaultImage}
            className="browse-product-card"
          />
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default Browse;