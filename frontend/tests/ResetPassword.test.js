import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPassword from '../src/pages/ResetPassword';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom';
import { CartContext } from '../src/context/CartContext';

// Mocking ReCAPTCHA component
jest.mock('react-google-recaptcha', () => ({ onChange }) => (
    <div data-testid="recaptcha" onClick={() => onChange('fake-captcha-token')}>
      Mocked reCAPTCHA
    </div>
  ));
  
  // Mocking environment variables
  process.env.REACT_APP_API_URL = 'http://localhost:4000';
  process.env.RECAPTCHA_SITE_KEY = 'fake-site-key';
  
  // Mocking useParams
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ token: 'fake-token' }),
  }));
  
  // Helper function to mock the fetch response
  const mockFetch = (response, success = true) => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(response),
        ok: success,
      })
    );
  };
  
  // Mock CartContext
  const mockCartContext = {
    cart: [],
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
  };
  
  describe('ResetPassword Component', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    const renderWithContext = (component) => {
      return render(
        <CartContext.Provider value={mockCartContext}>
          <Router>{component}</Router>
        </CartContext.Provider>
      );
    };
  
    test('renders the ResetPassword component without crashing', () => {
      renderWithContext(<ResetPassword />);
  
      expect(screen.getByText('Reset User Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
    });
  
    test('shows error message when CAPTCHA is not completed', async () => {
      renderWithContext(<ResetPassword />);
  
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'newpassword123' },
      });
  
      fireEvent.click(screen.getByText('Reset Password'));
  
      await waitFor(() => {
        expect(screen.getByText('Please complete the CAPTCHA.')).toBeInTheDocument();
      });
    });
  
    test('shows success message on successful password reset', async () => {
      const successResponse = { message: 'Password reset successfully.' };
      mockFetch(successResponse);
  
      renderWithContext(<ResetPassword />);
  
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'newpassword123' },
      });
  
      // Simulate reCAPTCHA completion
      fireEvent.click(screen.getByTestId('recaptcha'));
  
      // Submit the form
      fireEvent.click(screen.getByText('Reset Password'));
  
      await waitFor(() => {
        expect(screen.getByText('Password reset successfully.')).toBeInTheDocument();
      });
    });
  
    test('shows error message when password reset fails', async () => {
      const errorResponse = { message: 'Error resetting password.' };
      mockFetch(errorResponse, false);
  
      renderWithContext(<ResetPassword />);
  
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'newpassword123' },
      });
  
      // Simulate reCAPTCHA completion
      fireEvent.click(screen.getByTestId('recaptcha'));
  
      // Submit the form
      fireEvent.click(screen.getByText('Reset Password'));
  
      await waitFor(() => {
        expect(screen.getByText('Error resetting password.')).toBeInTheDocument();
      });
    });
  });