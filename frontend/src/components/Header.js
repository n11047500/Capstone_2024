import React, { useState, useEffect, useRef, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './Header.css';
import logoImage from '../assets/logo.png';
import shoppingCartImage from '../assets/ShoppingCartBlack.png';

function Header() {
  const { cart } = useContext(CartContext);
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null); 

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

  const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <header className="site-header">
        {/* Menu icon (Hamburger icon) */}
        <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>☰</div>

        {/* Logo */}
        <nav className='sidebar-nav'>
          <NavLink to="/" onClick={() => setIsOpen(false)}>
            <img src={logoImage} alt="EZee Planter Boxes" className="logo" />
          </NavLink>
          </nav>

        {/* Shopping cart icon */}
        <NavLink to="/cart" className="cart-link">
          <div className="cart-icon">
            <img src={shoppingCartImage} alt='Shopping Cart' />
            {totalItemsInCart > 0 && <div className="cart-counter">{totalItemsInCart}</div>}
          </div>
        </NavLink>
      </header>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`} ref={sidebarRef}>
        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
        <nav className="sidebar-nav">
          <NavLink to="/" onClick={() => setIsOpen(false)}>Home</NavLink>
          <NavLink to="/browse" onClick={() => setIsOpen(false)}>Browse</NavLink>
          <NavLink to="/aboutus" onClick={() => setIsOpen(false)}>About Us</NavLink>
          <NavLink to="/gallery" onClick={() => setIsOpen(false)}>Gallery</NavLink>
          <NavLink to="/contactus" onClick={() => setIsOpen(false)}>Contact Us</NavLink>
        </nav>
      </div>
    </>
  );
}

export default Header;
