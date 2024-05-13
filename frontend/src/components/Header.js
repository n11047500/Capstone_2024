import React, { useState } from 'react';
import './Header.css';
import logoImage from '../assets/logo.png';
import { NavLink } from 'react-router-dom';

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
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/browse">Browse</NavLink></li>
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
