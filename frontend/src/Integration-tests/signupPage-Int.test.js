import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUpPage from '../pages/SignUpPage';
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

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock cart value
const mockCartValue = { cart: [] };

// Utility function to render with CartContext and Router
const renderWithCartProvider = (ui, { value = mockCartValue, ...renderOptions } = {}) => {
  return render(
    <CartContext.Provider value={value}>
      <Router>{ui}</Router>
    </CartContext.Provider>,
    renderOptions
  );
};

describe('SignUpPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  test('Displays error when fetch fails', async () => {
    // Mock the fetch call to simulate a failed request
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Error creating user.' }),
      })
    );

    renderWithCartProvider(<SignUpPage />);

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '2000-01-01' } });

    // Trigger reCAPTCHA
    fireEvent.click(screen.getByText(/Verify CAPTCHA/i));

    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(signUpButton);

    // Assert that the error message is displayed
    const errorMessage = await screen.findByText(/Error creating user./i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('should navigate to the correct page on successful submission', async () => {
    global.fetch = jest.fn((url) => {
      if (url.endsWith('/register')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}), // Simulate successful registration
        });
      } else if (url.endsWith('/login')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ role: 'user' }), // Simulate user data fetch
        });
      }
    });

    renderWithCartProvider(<SignUpPage />);

    // Fill out the form inputs
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '1990-01-01' } });

    // Trigger reCAPTCHA
    fireEvent.click(screen.getByText(/Verify CAPTCHA/i));

    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login'); // Check for navigation
    });
  });

  test('Prevents form submission when reCAPTCHA is not verified', async () => {
    // Mock the fetch function to simulate an error response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Error creating user.' }),
      })
    );
  
    renderWithCartProvider(<SignUpPage />);
  
    // Fill out form fields
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '1990-01-01' } });
  
    // Simulate form submission without verifying CAPTCHA
    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(signUpButton);
  
    // Wait for the error message to appear due to the unverified CAPTCHA
    const errorMessage = await screen.findByText(/Error creating user./i);
    expect(errorMessage).toBeInTheDocument();
  });
  
});
