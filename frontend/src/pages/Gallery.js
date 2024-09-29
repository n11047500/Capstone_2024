import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Gallery.css';
import gallery1 from '../assets/gallery/gallery1.jpg';
import gallery2 from '../assets/gallery/gallery2.jpg';
import gallery3 from '../assets/gallery/gallery3.jpg';
import gallery4 from '../assets/gallery/gallery4.jpg';
import gallery5 from '../assets/gallery/gallery5.jpg';
import gallery6 from '../assets/gallery/gallery6.jpg';
import gallery7 from '../assets/gallery/gallery7.jpg';

const images = [gallery1, gallery2, gallery3, gallery4, gallery5, gallery6, gallery7]; // Array of images

function Gallery() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null); // State to track the selected image index
  const [isModalOpen, setIsModalOpen] = useState(false); // State to track if the modal is open

  // Function to handle when an image is clicked
  const handleImageClick = (index) => {
    setSelectedImageIndex(index); // Set the clicked image index as selected
    setIsModalOpen(true); // Open the modal
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedImageIndex(null); // Clear the selected image index
  };

  // Function to go to the next image
  const nextImage = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Function to go to the previous image
  const prevImage = () => {
    setSelectedImageIndex((prevIndex) => 
      (prevIndex - 1 + images.length) % images.length
    );
  };

  // Effect to handle keydown events when modal is open
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isModalOpen) {
        if (event.key === 'ArrowRight') {
          nextImage();
        } else if (event.key === 'ArrowLeft') {
          prevImage();
        } else if (event.key === 'Escape') {
          closeModal(); // Close modal on Esc key
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown); // Attach event listener

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  return (
    <div className="gallery">
      <Header />
      <h1>Gallery</h1>
      <h2>Locally designed and manufactured, EZee Planter Boxes bring the health benefits and the joy of gardening to all – including those with mobility adjustments.</h2>

      <div className="gallery-row">
        <div className="gallery-column">
          <img src={gallery1} alt="gallery1" onClick={() => handleImageClick(0)} />
          <img src={gallery2} alt="gallery2" onClick={() => handleImageClick(1)} />
          <img src={gallery3} alt="gallery3" onClick={() => handleImageClick(2)} />
          <img src={gallery4} alt="gallery4" onClick={() => handleImageClick(3)} />
        </div>
        <div className="gallery-column">
          <img src={gallery5} alt="gallery5" onClick={() => handleImageClick(4)} />
          <img src={gallery6} alt="gallery6" onClick={() => handleImageClick(5)} />
          <img src={gallery2} alt="gallery2" onClick={() => handleImageClick(1)} />
        </div>
        <div className="gallery-column">
          <img src={gallery6} alt="gallery6" onClick={() => handleImageClick(5)} />
          <img src={gallery1} alt="gallery1" onClick={() => handleImageClick(0)} />
          <img src={gallery7} alt="gallery7" onClick={() => handleImageClick(6)} />
        </div>
        <div className="gallery-column">
          <img src={gallery3} alt="gallery3" onClick={() => handleImageClick(2)} />
          <img src={gallery4} alt="gallery4" onClick={() => handleImageClick(3)} />
          <img src={gallery6} alt="gallery6" onClick={() => handleImageClick(5)} />
        </div>
      </div>

      {/* Modal for displaying the selected image */}
      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <span className="close" onClick={closeModal}>&times;</span>
          <button className="arrow left" onClick={(event) => { event.stopPropagation(); prevImage(); }}>&lt;</button>
          <img className="modal-content" src={images[selectedImageIndex]} alt="Selected" />
          <button className="arrow right" onClick={(event) => { event.stopPropagation(); nextImage(); }}>&gt;</button>
        </div>
      )}
      <br />
      <Footer />
    </div>
  );
}

export default Gallery;