import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import Slideshow from '../components/Slideshow';
import './HomePage.css';

const HomePage = () => {
  // State to store products fetched from the API
  const [products, setProducts] = useState([]);
  // State to store any error messages during data fetching
  const [error, setError] = useState(null);

  // Function to calculate how many product cards should be shown based on screen width
  const calculateSliceCount = (width) => {
    if (width > 1024) return 8; // For desktop screens
    if (width > 768) return 6; // For tablet screens
    if (width > 600) return 4; // For large mobile screens
    if (width > 480) return 3; // For small mobile screens
    return 2; // For extra-small screens
  };

  // State to manage the number of products displayed based on screen size
  const [sliceCount, setSliceCount] = useState(8);

  // Effect to update the number of products displayed when the window is resized
  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setSliceCount(calculateSliceCount(currentWidth));
    };

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call to set the slice count based on current window size

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Effect to fetch products from the API whenever the slice count changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Set products based on the calculated slice count
        setProducts(data.slice(0, sliceCount));
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products.'); // Update error state
      }
    };

    fetchProducts();
  }, [sliceCount]);

  return (
    <div className="HomePage">
      {/* Header component for consistent navigation */}
      <Header />
      <Slideshow />
      <div className="home_product_section">
        <h2>Featured Products</h2>
        {/* Display error message if there's an issue with fetching products */}
        {error && <div className="error-message">{error}</div>}
        <div className="home_product_container">
          {/* Map over products and display each using the ProductCard component */}
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
      {/* Footer component for consistent footer information */}
      <Footer />
    </div>
  );
};

export default HomePage;