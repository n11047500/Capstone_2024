import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import logoImage from '../assets/logo.png';
import ezeeind from '../assets/ezeeind.png';
import ezeefencing from '../assets/ezeefencing.png';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-logo">
        <img src={logoImage} alt="EZee Planter Boxes" sizes='150px'/>
        <p>Ranging from mini garden size right through to our large garden, our aluminium planter boxes won't rust or bend and come with a full manufacturing guarantee.</p>
      </div>
      <div className="footer-links">
        <h4>Explore</h4>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/browse">Shopping</Link></li>
          <li><Link to="/aboutus">About Us</Link></li>
          <li><Link to="/gallery">Gallery</Link></li>
          <li><Link to="/contactus">Contact Us</Link></li>
        </ul>
      </div>
      <div className="footer-contact">
        <h4>Contact Us</h4>
        <p>21 Huntington Street,<br/>Clontarf QLD 4019</p>
        <p><a href="tel:0732848180">07 3284 8180</a></p>
        <p><a href="mailto:info@ezeeplanters.com.au">info@ezeeplanters.com.au</a></p>
      </div>
      <div className="footer-businesses">
        <h4>Other EZee Businesses</h4>
          <div className ="image-links-container"> 
            <a href="https://www.ezeeindustries.com.au" target='_blank' rel="noopener noreferrer">
              <img src={ezeeind} alt="EZee Industries"/>
            </a>
            <a href="https://www.ezeefencing.com.au" target='_blank' rel="noopener noreferrer">
              <img src={ezeefencing} alt="EZee Fencing"/>
            </a>
        </div>
      </div>
      <div className="footer-payments">
        {/* Payment method logos */}
      </div>
    </footer>
  );
}

export default Footer;
