import React, { useState } from 'react';
import './Header.css';
import logoImage from '../assets/logo.png';

function Header() {
  const [isOpen, setIsOpen] = useState(false);  // State to manage menu visibility

  return (
    <header className="site-header">
      {/* Menu icon (Hamburger icon) */}
      <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>☰</div>

      {/* Navigation Links */}
      {isOpen && (
        <nav>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Products</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </nav>
      )}

      {/* Logo */}
      <img src={logoImage} alt="EZee Planter Boxes" className="logo" />

      {/* Shopping cart icon */}
      <div className="cart-icon">🛒</div>
    </header>
  );
}

export default Header;
