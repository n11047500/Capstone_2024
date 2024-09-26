import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './SignUpPage.css';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    mobileNumber: '',
    dateOfBirth: '',
  });
  const [captchaToken, setCaptchaToken] = useState(null); // Store reCAPTCHA token
  const [error, setError] = useState('');

  const handleCaptcha = (token) => {
    setCaptchaToken(token); // Set the reCAPTCHA token
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totalForm = { ...formData, captchaToken };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(totalForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error creating user. Please try again.');
      }

      const data = await response.json();
      console.log('User created successfully:', data);
      
      // Redirect to the login page
      navigate('/login');

    } catch (error) {
      console.error('Error creating user:', error);
      setError(error.message);
    }
  };

  return (
    <>
      <Header />
      <main>
        <div className="signup-container">
          <h1>Sign Up</h1>
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
            <ReCAPTCHA
              sitekey={process.env.RECAPTCHA_SITE_KEY || '6LfpyS4qAAAAACV-9rKjHiyxg9LR0FOr6nVUUu2j'}
              onChange={handleCaptcha}
              className='captcha-signup-container'
            />
            <button type="submit" className="signup-button">Sign Up</button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SignUpPage;