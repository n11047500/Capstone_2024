import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ProductPage.css';

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

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3001/products/${productId}`);
        const data = await response.json();
        console.log('Fetched product data:', data); // Log fetched data
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [productId]);

  if (!product) {
    return <div>Loading...</div>;
  }

  const productImage = imageMap[product.Product_Name];

  return (
    <>
      <Header />
      <div className="product-page">
        <div className="product-container">
          <div className="product-image">
            {productImage && <img src={productImage} alt={product.Product_Name} />}
          </div>
          <div className="product-details">
            <h1>{product.Product_Name}</h1>
            <p>{product.Description}</p>
            <p className="product-price">${product.Product_Price}</p>
            <div className="product-reviews">
              <span className="star">⭐</span> 4.9 · <a href="#reviews">142 reviews</a>
            </div>
            <select className="product-options">
              <option value="">Options</option>
              {/* Add more options as needed */}
            </select>
            <button className="add-to-cart">Add to Cart</button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductPage;
