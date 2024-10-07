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
import gallery8 from '../assets/gallery/gallery8.jpg';
import gallery9 from '../assets/gallery/gallery9.jpg';
import gallery10 from '../assets/gallery/gallery10.jpg';
import gallery11 from '../assets/gallery/gallery11.jpg';
import gallery12 from '../assets/gallery/gallery12.jpg';
import gallery13 from '../assets/gallery/gallery13.jpg';
import gallery14 from '../assets/gallery/gallery14.jpg';
import gallery15 from '../assets/gallery/gallery15.jpg';


const images = [
  gallery10,
  gallery5,
  gallery14,
  gallery9,
  gallery3,
  gallery6,
  gallery4,
  gallery2,
  gallery12,
  gallery8,
  gallery7,
  gallery11,
  gallery1,
];



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
          <img src={gallery10} alt="gallery10" onClick={() => handleImageClick(0)} />
          <img src={gallery3} alt="gallery3" onClick={() => handleImageClick(4)} />
          <img src={gallery12} alt="gallery12" onClick={() => handleImageClick(8)} />
        </div>
        <div className="gallery-column">
          <img src={gallery5} alt="gallery5" onClick={() => handleImageClick(1)} />
          <img src={gallery6} alt="gallery6" onClick={() => handleImageClick(5)} />
          <img src={gallery8} alt="gallery8" onClick={() => handleImageClick(9)} />
        </div>
        <div className="gallery-column">
          <img src={gallery14} alt="gallery14" onClick={() => handleImageClick(2)} />
          <img src={gallery4} alt="gallery4" onClick={() => handleImageClick(6)} />
          <img src={gallery7} alt="gallery7" onClick={() => handleImageClick(10)} />
        </div>
        <div className="gallery-column">
          <img src={gallery9} alt="gallery9" onClick={() => handleImageClick(3)} />
          <img src={gallery2} alt="gallery2" onClick={() => handleImageClick(7)} />
          <img src={gallery11} alt="gallery11" onClick={() => handleImageClick(11)} />
          <img src={gallery1} alt="gallery1" onClick={() => handleImageClick(12)} />
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