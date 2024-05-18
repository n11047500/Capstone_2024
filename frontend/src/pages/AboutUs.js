import Header from '../components/Header';
import Footer from '../components/Footer';
import './AboutUs.css';
import aboutus_image from '../assets/aboutus_image.jpg';

function AboutUs() {
  return (
    <div className="AboutUs">
      <Header/>

      <div className='about_section'>
      <img src={aboutus_image} alt="Planter Box in Location" className="aboutus_image" />
        <h1>
        ABOUT US
        </h1>
        <h2>
          Who Are We
        </h2>
        <p>
          We are a small, family run business who specialise in manufacturing gates and fencing. During Covid, we needed to diversify our range.<br/>-<br/>With a love of gardening but with mobility issues - we researched and designed a planter box that utilised products that were no longer required making a sustainable, hard wearing yet light weight, fully welded and strong planter box that limited back strain and made gardening fun again!<br/>-<br/>
          EZee Planter boxes are designed, made and manufactured right here in the Moreton Bay region and we look forward to providing you with a garden to enjoy - that is pain free!
        </p>
      </div>
      <Footer/>
    </div>
  );
}

export default AboutUs;
