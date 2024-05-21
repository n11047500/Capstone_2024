import React from 'react';
import { NavLink } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './LoginPage.css';

const LoginPage = () => {
  return (
    <>
      <Header />
      <div className="main-content">
      <div className="login-page-container">
        <h2>Login to EZee Planter Boxes</h2>
        <form className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <p className="signup-text">
          Don’t have an account? <NavLink to="/signup">Sign up</NavLink>
        </p>
      </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
