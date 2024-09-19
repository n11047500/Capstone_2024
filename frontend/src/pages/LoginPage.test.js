import React from 'react';
import { render, screen, fireEvent, waitFor, within  } from '@testing-library/react';
import LoginPage from './LoginPage';
import { BrowserRouter as Router } from 'react-router-dom';
import { CartProvider, CartContext } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Mocking the reCAPTCHA component
jest.mock('react-google-recaptcha', () => {
    return function DummyReCAPTCHA({ onChange }) {
      return <button onClick={() => onChange('mockToken')}>Verify CAPTCHA</button>;
    };
  });
  
  const mockCartValue = { cart: [] };
  
  const renderWithCartProvider = (ui, { value = mockCartValue, ...renderOptions } = {}) => {
    return render(
      <CartContext.Provider value={value}>
        <Router>{ui}</Router>
      </CartContext.Provider>,
      renderOptions
    );
  };
  
  describe('LoginPage', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    test('renders login form', async () => {
        renderWithCartProvider(<LoginPage />);
    
        // Ensure email and password fields are present
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    
        // Check "Forgot your password?" text within a <p> element
        expect(screen.getByText((content, element) => 
          element.tagName.toLowerCase() === 'p' && /forgot your password\?/i.test(content)
        )).toBeInTheDocument();
    
        // Check "Click here" text within an <a> element
        expect(screen.getByText((content, element) => 
          element.tagName.toLowerCase() === 'a' && /click here/i.test(content)
        )).toBeInTheDocument();
    
        // Check "Don't have an account? Sign Up" text within a <p> element
        const signupElement = screen.getByText((content, element) =>
          element.tagName.toLowerCase() === 'p' && /don't have an account\?/i.test(content)
        );
        expect(signupElement).toBeInTheDocument();
    
        // Check that the "Sign Up" link exists within the <p> element
        const linkElement = within(signupElement).getByRole('link', { name: /sign up/i });
        expect(linkElement).toBeInTheDocument();
        expect(linkElement).toHaveAttribute('href', '/signup');
      });
  
    test('successful login redirects to profile page', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ email: 'user@example.com', role: 'user' }),
        })
      );
  
      renderWithCartProvider(<LoginPage />);
  
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
      fireEvent.click(screen.getByText(/verify captcha/i)); // Trigger CAPTCHA verification
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
  
      await waitFor(() => {
        expect(window.location.pathname).toBe('/user/user@example.com'); // Update based on your routing setup
      });
    });
  
    test('shows error message for invalid login', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Invalid credentials' }),
        })
      );
  
      renderWithCartProvider(<LoginPage />);
  
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
      fireEvent.click(screen.getByText(/verify captcha/i)); // Trigger CAPTCHA verification
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
  
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  
    test('shows error if CAPTCHA is not completed', () => {
      renderWithCartProvider(<LoginPage />);
  
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
  
      expect(screen.getByText(/please complete the captcha/i)).toBeInTheDocument();
    });
  });