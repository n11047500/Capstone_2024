import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';


function SearchResults() {
  const [products, setProducts] = useState([]);
  const [results, setResults] = useState('');


  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/products`)
      .then(response => response.json())
      .then(data => {
        setProducts(data);
      })
      .catch(error => console.error('Error fetching products:', error));
  }, []);


  return (
    <div className="searchresults-page">
      <Header />
        <div>
            <ul>
                {Array.isArray(results) && results.length > 0 ? (
                    results.map((product) => (
                        <li key={product.id}>{product.name}</li>
                    ))
                ) : (
                    <li>No products found.</li>
                )}
            </ul>
        </div>
      <Footer />
    </div>
  );
}

export default SearchResults;
