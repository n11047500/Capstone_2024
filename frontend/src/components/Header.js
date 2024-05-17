import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import logoImage from '../assets/logo.png';
import { NavLink, Link } from 'react-router-dom';
import shoppingCart from '../assets/ShoppingCart.png';
import shoppingCartBlack from '../assets/ShoppingCartBlack.png';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);

  const currentPage = window.location.pathname;

  let shoppingCartImage;
  if (currentPage === "/") {
    shoppingCartImage = shoppingCart;
  } else {
    shoppingCartImage = shoppingCartBlack;
  }

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
        <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>☰</div>
        <NavLink to="/" className="logo-link">
          <img src={logoImage} alt="EZee Planter Boxes" className="logo" />
        </NavLink>
        <div className="cart-icon">
          <Link to="/cart">
            <img src={shoppingCartImage} alt="Shopping Cart" />
          </Link>
        </div>
      </header>
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
