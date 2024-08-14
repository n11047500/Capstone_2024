import React, { useEffect, useState } from 'react';
import './Slideshow.css';
import top_image from '../assets/homepage_image1.jpg';
import image2 from '../assets/gallery/gallery1.jpg';
const imageUrls = [
    top_image,
    image2
];

function Slideshow({ children }) { // Accept children to render content within the slideshow
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % imageUrls.length);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slideshow-container">
      {imageUrls.map((url, index) => (
        <div
          key={index}
          className={`slide ${currentSlide === index ? 'active' : ''}`}
          style={{ backgroundImage: `url(${url})` }}
        >
          {currentSlide === index && children} {/* Render children only on the active slide */}
        </div>
      ))}
    </div>
  );
}

export default Slideshow;
