import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './LoginPage.css';

const LoginPage = () => {
  // State variables for managing email, password, error messages, and reCAPTCHA token
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null); // Store reCAPTCHA token
  const navigate = useNavigate();

  // Handle setting the reCAPTCHA token when the CAPTCHA is completed
  const handleCaptcha = (token) => {
    setCaptchaToken(token); // Set the reCAPTCHA token
  };

  // Handle form submission for login
  const handleLogin = async (e) => {
    e.preventDefault();

    // Check if reCAPTCHA has been completed
    if (!captchaToken) {
      setError('Please complete the CAPTCHA.');
      return;
    }

    try {
      // Send login request to the backend API
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captchaToken })
      });

      // Handle successful login response
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userRole', data.role);
        navigate(`/user/${data.email}`); // Navigate to the user profile page
      } else {
        // Handle error response from the server
        const data = await response.json();
        setError(data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      // Handle any unexpected errors during the request
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <>
      {/* Header component for consistent navigation */}
      <Header />
      <main>
        <div className="login-container">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <label htmlFor='email'>Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor='password'>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* Link to the Forgot Password page */}
            <p className="forgot-link">
              Forgot your password? <a href="/forgot-password">Click Here</a>
            </p>
            {/* Google reCAPTCHA for user verification */}
            <ReCAPTCHA
              sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
              onChange={handleCaptcha}
              className='captcha-login-container'
            />
            <button type="submit" className="login-button">Login</button>
          </form>
          {/* Display error message if any */}
          {error && <p className="error-message">{error}</p>}
          {/* Link to the signup page */}
          <p className="signup-link">
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </main>
      {/* Footer component for consistent site information */}
      <Footer />
    </>
  );
};

export default LoginPage;