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
          <li><a href="#">Home</a></li>
          <li><a href="#">Shopping</a></li>
          <li><a href="#">About Us</a></li>
          <li><a href="#">Gallery</a></li>
          <li><a href="#">Contact Us</a></li>
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
        <a href="https://www.ezeeindustries.com.au" target='_blank' rel="noopener norefferer">
          <img src={ezeeind} alt="EZee Industries"/>
        </a>
          <img src={ezeefencing} alt="EZee Fencing"/>
      </div>
      <div className="footer-payments">
        {/* Payment method logos */}
      </div>
    </footer>
  );
}

export default Footer;
