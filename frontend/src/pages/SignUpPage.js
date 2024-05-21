import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './SignUpPage.css';

const SignUpPage = () => {
  return (
    <>
      <Header />
      <div className="signup-container">
        <h1>Sign Up</h1>
        <form className="signup-form">
          <div className="form-group">
            <label htmlFor="first-name">First name: *</label>
            <input type="text" id="first-name" required />
          </div>
          <div className="form-group">
            <label htmlFor="last-name">Last name: *</label>
            <input type="text" id="last-name" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email: *</label>
            <input type="email" id="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="mobile-number">Mobile number:</label>
            <input type="tel" id="mobile-number" placeholder="(optional)" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password: *</label>
            <input type="password" id="password" required />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm password: *</label>
            <input type="password" id="confirm-password" required />
          </div>
          <button type="submit" className="signup-button">Sign Up</button>
        </form>
        <p className="signup-footer">Already have an account? <a href="/login">Login</a></p>
      </div>
      <Footer />
    </>
  );
};

export default SignUpPage;
