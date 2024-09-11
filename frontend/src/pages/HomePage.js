import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import Slideshow from '../components/Slideshow';
import './HomePage.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);

  // Function to calculate the number of slices based on window size
  const calculateSliceCount = (width) => {
    if (width > 1200) {
      return 10; // Large screen (desktop)
    } else if (width > 1024) {
      return 8; // Medium-large screen (small desktop)
    } else if (width > 768) {
      return 6; // Medium screen (tablet)
    } else if (width > 600) {
      return 4; // Small-medium screen (large mobile or small tablet)
    } else if (width > 480) {
      return 3; // Small screen (mobile)
    } else {
      return 2; // Extra-small screen (small mobile)
    }
  };
  
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sliceCount, setSliceCount] = useState(1); // Default slice count

  // Handle window resize and update slice count
  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setWindowWidth(currentWidth);
      setSliceCount(calculateSliceCount(currentWidth));
    };

    // Listen for window resize
    window.addEventListener('resize', handleResize);

    // Set initial slice count based on the current window size
    handleResize();

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fetch products and update based on sliceCount
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/products`)
      .then(response => response.json())
      .then(data => {
        setProducts(data.slice(0, sliceCount));
      })
      .catch(error => console.error('Error fetching products:', error));
  }, [sliceCount]); // Dependency array includes sliceCount


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
