import React, { useState } from 'react';
import './LoginPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Login successful');
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <>
      <Header />
      <main>
        <div className="login-container">
          <h1>Login to EZee Planter Boxes</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">Login</button>
          </form>
          <div className="signup-link">
            Don’t have an account? <a href="/signup">Sign up</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LoginPage;
