import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../pages/LoginPage';
import { BrowserRouter as Router } from 'react-router-dom';
import { CartProvider, CartContext } from '../context/CartContext';

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

describe('LoginPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });
  //test ensures Captcha error message appears after failing to complete the Captcha verification
  test('should display error message when CAPTCHA is not completed', async () => {
    renderWithCartProvider(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });

    const loginButton = screen.getByRole('button', { name: /Login/i });
    fireEvent.click(loginButton);

    const errorMessage = await screen.findByText(/Please complete the CAPTCHA./i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('Displays error message when fetch does fail', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      })
    );

    renderWithCartProvider(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpassword' } });

    // Trigger reCAPTCHA
    fireEvent.click(screen.getByText(/Verify CAPTCHA/i));

    const loginButton = screen.getByRole('button', { name: /Login/i });
    fireEvent.click(loginButton);

    const errorMessage = await screen.findByText(/Invalid credentials/i);
    expect(errorMessage).toBeInTheDocument();
  });
  // test ensures after successful login they are redirected to the correct page being the user page
  test('Should navigate to user page when successful login completed', async () => {
    global.fetch = jest.fn((url) => {
      if (url.endsWith('/login')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ email: 'test@example.com', role: 'user' }), // Simulate successful login
        });
      }
    });

    renderWithCartProvider(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });

    // Trigger reCAPTCHA
    fireEvent.click(screen.getByText(/Verify CAPTCHA/i));

    const loginButton = screen.getByRole('button', { name: /Login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/user/test@example.com'); // Check for navigation
    });
  });
});
