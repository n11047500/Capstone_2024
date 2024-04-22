import React from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import Footer from './components/Footer';
import './App.css';

function App() {
  // Sample products data
  const products = [
    { id: 1, title: 'Product Title', price: 'Price' },
    { id: 2, title: 'Product Title', price: 'Price' },
    { id: 3, title: 'Product Title', price: 'Price' },
    // Add more products as needed
  ];

  return (
    <div className="App">
      <Header />
      <div className="product-container">
        {products.map(product => (
          <ProductCard key={product.id} title={product.title} price={product.price} />
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default App;
