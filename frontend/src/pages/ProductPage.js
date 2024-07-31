import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CartContext } from '../context/CartContext';
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
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3001/products/${productId}`);
        const data = await response.json();
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

  const handleAddToCart = () => {
    if (!selectedOption && product.Product_Options.length > 0) {
      alert('Please select an option');
      return;
    }
    addToCart({ ...product, selectedOption }, quantity);
  };

  return (
    <>
      <Header />
      <div className="product-page-container">
        <div className="product-container product-page">
          <div className="product-image product-page">
            {productImage && <img src={productImage} alt={product.Product_Name} />}
          </div>
          <div className="product-details product-page">
            <h1 className="product-title product-page">{product.Product_Name}</h1>
            <p className="product-description product-page">{product.Description}</p>
            <p className="product-dimensions product-page"><strong>Dimensions:</strong> {product.Product_Dimensions}</p>
            <p className="product-price product-page">${product.Product_Price}</p>
            <div className="product-reviews product-page">
              <span className="star product-page">⭐</span> 4.9 · <a href="#reviews" className="product-page">142 reviews</a>
            </div>
            {product.Product_Options.length > 0 && (
              <select
                className="product-options product-page"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
              >
                <option value="">Select an option</option>
                {product.Product_Options.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            )}
            <div className="quantity-container product-page">
              <label htmlFor="quantity" className="product-page">Quantity:</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="quantity-input product-page"
              />
            </div>
            <button className="add-to-cart product-page" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductPage;
