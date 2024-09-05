import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

      <div className="home_customised_section">
        <h2 className="order-text">Order Customised Ezee Planter Box</h2>
        <h3 className="order-text-small">Ezee Planter Boxes provides customers a customisable design of their own if they so choose.</h3>

        <div className="order_customised">
          <button className="order-button"><Link to={`/customise`}>Order Customised Ezee Planter Box</Link></button>
        </div> <br />
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
