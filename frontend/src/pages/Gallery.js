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
  return (
    <div className="gallery">
      <Header/>
      <h1>Gallery</h1>
      <h2>Locally designed and manufactured, EZee Planter Boxes bring the health benefits and the joy of gardening to all – including those with mobility adjustments.</h2>
      <div className="gallery-row">
        <div className="gallery-column">
          <img src={gallery1} alt="gallery1"/>
          <img src={gallery2} alt="gallery2"/>
          <img src={gallery3} alt="gallery3"/>
          <img src={gallery4} alt="gallery4"/>
        </div>
        <div className="gallery-column">
          <img src={gallery5} alt="gallery5"/>
          <img src={gallery6} alt="gallery6"/>
          <img src={gallery2} alt="gallery2"/>
        </div>
        <div className="gallery-column">
          <img src={gallery6} alt="gallery6"/>
          <img src={gallery1} alt="gallery1"/>
          <img src={gallery7} alt="gallery7"/>
        </div>
        <div className="gallery-column">
          <img src={gallery3} alt="gallery3"/>
          <img src={gallery4} alt="gallery4"/>
          <img src={gallery6} alt="gallery6"/>
        </div>
      </div>
      <br></br>
      <Footer/>
    </div>
  );
}

export default Gallery;
