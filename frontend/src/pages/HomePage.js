import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import Slideshow from '../components/Slideshow';
import './HomePage.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/products`)
      .then(response => response.json())
      .then(data => {
        setProducts(data.slice(0, 6));
      })
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  return (
    <div className="HomePage">
      <Header />
      <Slideshow>
        <div className='motto_section'>
          <h1 className='motto_text'>The pain-free gardening solution suitable for everybody.</h1>
        </div>
      </Slideshow>
      <div className="home_product_section">
        <h2>Featured Products</h2>
        <div className="home_product_container">
          {products.map(product => (
            <ProductCard
              key={product.Product_ID}
              productId={product.Product_ID}
              title={product.Product_Name}
              price={`$${product.Product_Price}`}
              image={product.Product_Image_URL}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
