import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './SignUpPage.css';

const SignUpPage = () => {
  const navigate = useNavigate();
  const recaptchaRef = useRef();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    mobileNumber: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error creating user. Please try again.');
      }

      const data = await response.json();
      console.log('User created successfully:', data);

      const userResponse = await fetch(`${process.env.REACT_APP_API_URL}/user/${formData.email}`);
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user details after signup.');
      }

      const userData = await userResponse.json();

      localStorage.setItem('userRole', userData.role);

      if (userData.role === 'employee') {
        navigate('/employee-dashboard');
      } else {
        navigate(`/user/${formData.email}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error.message);
    }

    const token = recaptchaRef.current.getValue(); // Get reCAPTCHA token
    if (!token) {
        alert('Please verify you are not a robot.');
        return;
    }

    // Prepare form data
    formData.append('recaptchaToken', token);

    // Send form data to your server
    const response = await fetch('/submit-form', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    if (result.success) {
        alert('Form submitted successfully!');
    } else {
        alert('Failed to submit form. Please try again.');
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
            <div className="captcha-signup-container">
                  <ReCAPTCHA
                  sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                  ref={recaptchaRef}/>
            </div>
            <button type="submit" className="signup-button">Sign Up</button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SignUpPage;