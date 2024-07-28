import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="close-btn" onClick={toggleSidebar}>×</button>
      <nav className="sidebar-nav">
        <Link to="/" onClick={toggleSidebar}>Home</Link>
        <Link to="/products" onClick={toggleSidebar}>Products</Link>
        <Link to="/about" onClick={toggleSidebar}>About Us</Link>
        <Link to="/contact" onClick={toggleSidebar}>Contact Us</Link>
      </nav>
    </div>
  );
};

export default Sidebar;

