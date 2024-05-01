import React from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import Footer from './components/Footer';
import './App.css';

function App() {
  const products = [
    { id: 1, title: 'Product Title', price: 'Price' },
    { id: 2, title: 'Product Title', price: 'Price' },
    { id: 3, title: 'Product Title', price: 'Price' },
  ];

  return (
    <div className="App">  {/* Make sure this class matches your CSS for full height and flex settings */}
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
