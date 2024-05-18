import Header from '../components/Header';
import Footer from '../components/Footer';
import './Gallery.css';
import gallery1 from '../assets/gallery1.jpg';
import gallery2 from '../assets/gallery2.jpg';
import gallery3 from '../assets/gallery3.jpg';
import gallery4 from '../assets/gallery4.jpg';
import gallery5 from '../assets/gallery5.jpg';
import gallery6 from '../assets/gallery6.jpg';
import gallery7 from '../assets/gallery7.jpg';

function Gallery() {
  return (
    <div className="Gallery">
      <Header/>
      <div className='gallery_sections'>
        <p className='gallery_rows'>
          <img src={gallery1} alt="About Us" className='gallery_image' />
          <img src={gallery2} alt="About Us" className='gallery_image'/>
          <img src={gallery3} alt="About Us" className='gallery_image'/>
          <img src={gallery4} alt="About Us" className='gallery_image'/>
        </p>
        <p className='gallery_rows'>
          <img src={gallery5} alt="About Us" className='gallery_image'/>
          <img src={gallery6} alt="About Us" className='gallery_image'/>
          <img src={gallery7} alt="About Us" className='gallery_image'/>
          <img src={gallery1} alt="About Us" className='gallery_image'/>
        </p>
      </div>
      <Footer/>
    </div>
  );
}

export default Gallery;
