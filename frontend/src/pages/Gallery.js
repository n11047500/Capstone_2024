import React, {useState} from 'react';
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

function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null); // State to track the selected image
  const [isModalOpen, setIsModalOpen] = useState(false); // State to track if the modal is open

  // Function to handle when an image is clicked
  const handleImageClick = (image) => {
    setSelectedImage(image); // Set the clicked image as selected
    setIsModalOpen(true); // Open the modal
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedImage(null); // Clear the selected image
  };

  return (
    <div className="gallery">
      <Header/>
      <h1>Gallery</h1>
      <h2>Locally designed and manufactured, EZee Planter Boxes bring the health benefits and the joy of gardening to all – including those with mobility adjustments.</h2>

      <div className="gallery-row">
        <div className="gallery-column">
          <img src={gallery1} alt="gallery1" onClick={() => handleImageClick(gallery1)} />
          <img src={gallery2} alt="gallery2" onClick={() => handleImageClick(gallery2)} />
          <img src={gallery3} alt="gallery3" onClick={() => handleImageClick(gallery3)} />
          <img src={gallery4} alt="gallery4" onClick={() => handleImageClick(gallery4)} />
        </div>
        <div className="gallery-column">
          <img src={gallery5} alt="gallery5" onClick={() => handleImageClick(gallery5)} />
          <img src={gallery6} alt="gallery6" onClick={() => handleImageClick(gallery6)} />
          <img src={gallery2} alt="gallery2" onClick={() => handleImageClick(gallery2)} />
        </div>
        <div className="gallery-column">
          <img src={gallery6} alt="gallery6" onClick={() => handleImageClick(gallery6)} />
          <img src={gallery1} alt="gallery1" onClick={() => handleImageClick(gallery1)} />
          <img src={gallery7} alt="gallery7" onClick={() => handleImageClick(gallery7)} />
        </div>
        <div className="gallery-column">
          <img src={gallery3} alt="gallery3" onClick={() => handleImageClick(gallery3)} />
          <img src={gallery4} alt="gallery4" onClick={() => handleImageClick(gallery4)} />
          <img src={gallery6} alt="gallery6" onClick={() => handleImageClick(gallery6)} />
        </div>
      </div>

      {/* Modal for displaying the selected image */}
      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <span className="close">&times;</span>
          <img className="modal-content" src={selectedImage} alt="Selected" />
        </div>
      )}
      <br></br>
      <Footer/>
    </div>
  );
}

export default Gallery;
