import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './SignUpPage.css';

const SignUpPage = () => {
  // Navigation function for redirecting users
  const navigate = useNavigate();
  // State to manage form data inputs
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    mobileNumber: '',
    dateOfBirth: '',
  });
  // State to store reCAPTCHA token
  const [captchaToken, setCaptchaToken] = useState(null);
  // State for managing error messages
  const [error, setError] = useState('');

  // Handler for reCAPTCHA token update
  const handleCaptcha = (token) => {
    setCaptchaToken(token);
  };

  // Handle form input changes and update form data state
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission for user registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Combine form data with the CAPTCHA token
      const totalForm = { ...formData, captchaToken };

      // Send registration data to the backend API
      const response = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(totalForm),
      });

      // Handle response and possible errors
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error creating user. Please try again.');
      }

      const data = await response.json();
      console.log('User created successfully:', data);
      
      // Redirect to the login page upon successful registration
      navigate('/login');

    } catch (error) {
      console.error('Error creating user:', error);
      setError(error.message); // Update error state with the error message
    }
  };

  return (
    <>
      {/* Header component for consistent site navigation */}
      <Header />
      <main>
        <div className="signup-container">
          <h1>Sign Up</h1>
          {/* Display error message if present */}
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="firstName">First Name:</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <label htmlFor="lastName">Last Name:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <label htmlFor="mobileNumber">Mobile Number:</label>
            <input
              type="text"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
            />
            <label htmlFor="dateOfBirth">Date of Birth:</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
            {/* Google reCAPTCHA component for verification */}
            <ReCAPTCHA
              sitekey={process.env.RECAPTCHA_SITE_KEY}
              onChange={handleCaptcha}
              className='captcha-signup-container'
            />
            <button type="submit" className="signup-button">Sign Up</button>
          </form>
        </div>
      </main>
      {/* Footer component for consistent site information */}
      <Footer />
    </>
  );
};

export default SignUpPage;
