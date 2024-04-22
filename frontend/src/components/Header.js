import React from 'react';
import './Header.css';
import logoImage from '../assets/logo.png';


function Header() {
  return (
    <header className="site-header">
      {/* Menu icon (Hamburger icon) */}
      <div className="menu-icon">☰</div>

      {/* Logo */}
      <img src={logoImage} alt="EZee Planter Boxes" className="logo" />

      {/* Shopping cart icon */}
      <div className="cart-icon">🛒</div>
    </header>
  );
}

export default Header;
