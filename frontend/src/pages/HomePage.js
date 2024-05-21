import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import './HomePage.css';
import home_icon from '../assets/home_icon.png';
import top_image from '../assets/homepage_image1.jpg';

import large_planter_tray from '../assets/large_planter_tray.jpg';
import desktop_planter_box from '../assets/desktop_planter_box.jpg';
import accessibility_planter_box from '../assets/accessibility_planter_box.jpg';
import small_standard_planter_box from '../assets/small_standard_planter_box.jpg';
import mini_standard_planter_box from '../assets/mini_standard_planter_box.jpg';
import mini_wicking_planter_box from '../assets/mini_wicking_planter_box.jpg';
import insta_garden_range from '../assets/insta_garden_range.jpg';
import large_standard_planter_box from '../assets/large_standard_planter_box.jpg';
import large_wicking_planter_box from '../assets/large_wicking_planter_box.jpg';
import medium_standard_planter_box from '../assets/medium_standard_planter_box.jpg';
import medium_wicking_planter_box from '../assets/medium_wicking_planter_box.jpg';
import side_table from '../assets/side_table.jpg';
import small_planter_tray from '../assets/small_planter_tray.jpg';
import small_wicking_planter_box from '../assets/small_wicking_planter_box.jpg';
import trellis from '../assets/trellis.jpg';

const imageMap = {
  'Mini Standard Planter Box': mini_standard_planter_box,
  'Small Standard Planter Box': small_standard_planter_box,
  'Medium Standard Planter Box': medium_standard_planter_box,
  'Large Standard Planter Box': large_standard_planter_box,
  'Mini Wicking Planter Box': mini_wicking_planter_box,
  'Small Wicking Planter Box': small_wicking_planter_box,
  'Medium Wicking Planter Box': medium_wicking_planter_box,
  'Large Wicking Planter Box': large_wicking_planter_box,
  'Small Planter Tray': small_planter_tray,
  'Large Planter Tray': large_planter_tray,
  'Desktop Planter Box': desktop_planter_box,
  'Accessibility Planter Box': accessibility_planter_box,
  'Insta Garden Range': insta_garden_range,
  'Side Table': side_table,
  'Trellis': trellis,
};

function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/products')
      .then(response => response.json())
      .then(data => {
        const productsWithImages = data.map(product => ({
          ...product,
          image: imageMap[product.Product_Name] || ''
        }));
        setProducts(productsWithImages.slice(0, 6)); // Only take the first 6 products
      })
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  return (
    <div className="HomePage">
      <Header />
      <img src={top_image} alt="planter_box" className="landpage_image" />
      <div className='motto_section'>
        <img src={home_icon} alt="Planter Icon" className="motto_image" />
        <h1 className='motto_text'>The pain-free gardening solution suitable for everybody.</h1>
      </div>
      <div className="home_product_section">
        <h2>Featured Products</h2>
        <div className="home_product_container">
          {products.map(product => (
            <ProductCard
              key={product.Product_ID}
              productId={product.Product_ID}
              title={product.Product_Name}
              price={`$${product.Product_Price}`}
              image={product.image}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;
