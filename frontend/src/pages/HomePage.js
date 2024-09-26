import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import Slideshow from '../components/Slideshow';
import './HomePage.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null); // To store error messages

  const calculateSliceCount = (width) => {
    if (width > 1200) return 10; // Large screen (desktop)
    if (width > 1024) return 8; // Medium-large screen (small desktop)
    if (width > 768) return 6; // Medium screen (tablet)
    if (width > 600) return 4; // Small-medium screen (large mobile or small tablet)
    if (width > 480) return 3; // Small screen (mobile)
    return 2; // Extra-small screen (small mobile)
  };

  const [sliceCount, setSliceCount] = useState(10);

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setSliceCount(calculateSliceCount(currentWidth));
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial slice count based on current window size

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data.slice(0, sliceCount));
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products.'); // Set error state
      }
    };

    fetchProducts();
  }, [sliceCount]);

  return (
    <div className="HomePage">
      <Header />
      <Slideshow>
      </Slideshow>
      <div className="home_product_section">
        <h2>Featured Products</h2>
        {error && <div className="error-message">{error}</div>} {/* Display error message */}
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
