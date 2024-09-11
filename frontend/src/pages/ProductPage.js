import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CartContext } from '../context/CartContext';
import './ProductPage.css';

const ProductPage = () => {
  const { productId } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState('');
  const defaultImage = 'https://res.cloudinary.com/dakwlrcqr/image/upload/v1725604960/HicksProductDefault_op2oce.gif';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/${productId}`);
        const data = await response.json();
        data.averageRating = Number(data.averageRating); // Ensure it's a number
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

  const productImage = product.Product_Image_URL || defaultImage;

  const handleAddToCart = () => {
    if (!selectedOption && product.Product_Options.length > 0) {
      alert('Please select an option');
      return;
    }
    addToCart({ ...product, selectedOption }, quantity);
  };

  var options = product.Product_Options;
  if (typeof options !== 'string') {
    options = String(options);
  }
  var optionArray = options.split(',');
  product.Product_Options = optionArray;

  const averageRating = new Intl.NumberFormat('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(product.averageRating);

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
            <span className="star product-page">⭐</span> {averageRating} &nbsp;·&nbsp;  
              <Link to={`/reviews/${productId}`} className="product-page">{product.reviewCount} reviews</Link>
            </div>
            {product.Product_Options.length > 1 && (
              <select
                className="product-options product-page"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
              >
                <option value="">Select an option</option>
                {product.Product_Options.map((option) => (
                  <option key={option} value={option}>{option}</option>
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
