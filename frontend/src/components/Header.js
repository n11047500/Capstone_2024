import React, { useState, useEffect, useRef, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './Header.css';
import logoImage from '../assets/logo.png';
import shoppingCartImage from '../assets/ShoppingCartBlack.png';
import userIconImage from '../assets/UserIconBlack.png';

function Header() {
  const { cart } = useContext(CartContext);
  const [isOpen, setIsOpen] = useState(false); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const sidebarRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isOpen || isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isDropdownOpen]);

  const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const userEmail = localStorage.getItem('userEmail');

  return (
    <>
      <header className="site-header">
        {/* Menu icon (Hamburger icon) */}
        <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>☰</div>

        {/* Logo */}
        <nav>
          <NavLink to="/" onClick={() => setIsOpen(false)}>
            <img src={logoImage} alt="EZee Planter Boxes" className="logo" />
          </NavLink>
        </nav>

        <div className="right-icons">
          {/* User icon with dropdown */}
          <div className="user-icon-container" ref={dropdownRef}>
            <img src={userIconImage} alt="User Icon" className="user-icon" onClick={() => setIsDropdownOpen(!isDropdownOpen)} />
            {isDropdownOpen && (
              <div className="dropdown-menu">
                {userEmail ? (
                  <>
                    <NavLink to={`/user/${userEmail}`} className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Profile</NavLink>
                    <div className="dropdown-item" onClick={handleLogout}>Log Out</div>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Login</NavLink>
                    <NavLink to="/signup" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Sign Up</NavLink>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Shopping cart icon */}
          <NavLink to="/cart" className="cart-link">
            <div className="cart-icon">
              <img src={shoppingCartImage} alt='Shopping Cart' />
              {totalItemsInCart > 0 && <div className="cart-counter">{totalItemsInCart}</div>}
            </div>
          </NavLink>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`} ref={sidebarRef}>
        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
        <nav className="sidebar-nav">
          <NavLink to="/" onClick={() => setIsOpen(false)}>Home</NavLink>
          <NavLink to="/browse" onClick={() => setIsOpen(false)}>Browse</NavLink>
          <NavLink to="/customise" onClick={() => setIsOpen(false)}>Custom Planter Box</NavLink>
          <NavLink to="/aboutus" onClick={() => setIsOpen(false)}>About Us</NavLink>
          <NavLink to="/gallery" onClick={() => setIsOpen(false)}>Gallery</NavLink>
          <NavLink to="/contactus" onClick={() => setIsOpen(false)}>Contact Us</NavLink>
        </nav>
      </div>
    </>
  );
}

export default Header;
