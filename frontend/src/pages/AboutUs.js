import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AboutUs.css';
import aboutus_image from '../assets/aboutus_image.jpg';

// Functional component for the About Us page
function AboutUs() {
  return (
    <div className="AboutUs">
      {/* Header component */}
      <Header />

      <div className='about_section'>
        <div className='text-content'>
          <h1>ABOUT US</h1>
          <h2>Who Are We?</h2>
          <p>
            {/* Description of the company with background details */}
            We are a small, family run business who specialise in manufacturing gates and fencing. 
            During Covid, we needed to diversify our range.<br />-<br />
            With a love of gardening but with mobility issues - we researched and designed a planter 
            box that utilised products that were no longer required making a sustainable, hard wearing 
            yet light weight, fully welded and strong planter box that limited back strain and made 
            gardening fun again!<br />-<br />
            EZee Planter boxes are designed, made and manufactured right here in the Moreton Bay 
            region and we look forward to providing you with a garden to enjoy - that is pain free!
          </p>
        </div>
        {/* Image showcasing the planter box */}
        <img src={aboutus_image} alt="Planter Box in Location" className="aboutus_image" />
      </div>

      {/* Footer component */}
      <Footer />
    </div>
  );
}

export default AboutUs;
