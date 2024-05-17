import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import logoImage from '../assets/logo.png';
import { NavLink } from 'react-router-dom';
import shoppingCart from '../assets/ShoppingCart.png';
import shoppingCartBlack from '../assets/ShoppingCartBlack.png';

function Header() {
  const [isOpen, setIsOpen] = useState(false);  // State to manage sidebar visibility
  const sidebarRef = useRef(null);  // Reference to the sidebar

  const currentPage = window.location.pathname;  // Get the current page path

  // Determine the shopping cart image based on the current page
  let shoppingCartImage;
  if (currentPage === "/") {
    shoppingCartImage = shoppingCart;
  } else {
    shoppingCartImage = shoppingCartBlack;
  }

  // Close sidebar if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <header className="site-header">
        {/* Menu icon (Hamburger icon) */}
        <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>☰</div>

        {/* Logo */}
        <NavLink to="/" className="logo-link">
          <img src={logoImage} alt="EZee Planter Boxes" className="logo" />
        </NavLink>

        {/* Shopping cart icon */}
        <div className="cart-icon">
          <img src={shoppingCartImage} alt="Shopping Cart" />
        </div>
      </header>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`} ref={sidebarRef}>
        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
        <nav className="sidebar-nav">
          <NavLink to="/" onClick={() => setIsOpen(false)}>Home</NavLink>
          <NavLink to="/browse" onClick={() => setIsOpen(false)}>Browse</NavLink>
          <NavLink to="/aboutus" onClick={() => setIsOpen(false)}>About Us</NavLink>
        </nav>
      </div>
    </>
  );
}

export default Header;
