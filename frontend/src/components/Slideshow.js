import React, { useEffect, useState } from 'react';
import './Slideshow.css';
import { Link } from 'react-router-dom';
import top_image from '../assets/homepage_image1.jpg';
import image2 from '../assets/gallery/gallery1.jpg';
const imageUrls = [
    top_image,
    image2
];

function Slideshow({ children }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % imageUrls.length);
      }, 12000);
      
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  const handlePrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + imageUrls.length) % imageUrls.length);
    setIsPaused(true); // Pause auto-slide when using controls
  };

  const handleNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % imageUrls.length);
    setIsPaused(true); // Pause auto-slide when using controls
  };

  return (
    <div className="slideshow-container">
      {imageUrls.map((url, index) => (
        <div
          key={index}
          className={`slide ${currentSlide === index ? 'active' : ''}`}
          style={{ backgroundImage: `url(${url})` }}
        >
          {currentSlide === index && (
            <>
              {children}
              {/* Conditionally render the motto on the first slide */}
              {index === 0 && <h2 className="motto_text">The pain-free gardening solution suitable for everybody.</h2>}
              {index === 1 && (
                <div className="home_customised_section">
                  <h2 className="customised_slide_text">Order Customised Ezee Planter Box</h2>
                    <button className="order-button">
                      <Link to={`/customise`}>Order Customised Ezee Planter Box</Link>
                    </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {/* Slide Controls */}
      <button className="prev" onClick={handlePrevSlide}>←</button>
      <button className="next" onClick={handleNextSlide}>→</button>
    </div>
  );
}
export default Slideshow;
