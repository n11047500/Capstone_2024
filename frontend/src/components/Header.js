import React, { useState } from 'react';
import './Header.css';
import logoImage from '../assets/logo.png';
import { NavLink } from 'react-router-dom';
import shoppingCart from '../assets/ShoppingCart.png';
import shoppingCartBlack from '../assets/ShoppingCartBlack.png';

function Header() {
  const [isOpen, setIsOpen] = useState(false);  // State to manage menu visibility

  const currentPage = window.location.pathname;  // Get the current page path

  // Determine the shopping cart image based on the current page
  let shoppingCartImage;
  if (currentPage === "/") {
    shoppingCartImage = shoppingCart;
  } else {
    shoppingCartImage = shoppingCartBlack;
  }

  return (
    <header className="site-header">
      {/* Menu icon (Hamburger icon) */}
      <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>☰</div>

      {/* Navigation Links */}
      {isOpen && (
        <nav>
          <ul>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/browse">Browse</NavLink></li>
            <li><NavLink to="/aboutus">About Us</NavLink></li>
            <li><NavLink to="/gallery">Gallery</NavLink></li>
          </ul>
        </nav>
      )}

      {/* Logo */}
      <img src={logoImage} alt="EZee Planter Boxes" className="logo" />

      {/* Shopping cart icon */}
      <div className="cart-icon">
        <img src={shoppingCartImage} alt='Shopping Cart'></img>
      </div>
    </header>
  );
}

export default Header;
