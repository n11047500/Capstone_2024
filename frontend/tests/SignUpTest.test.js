import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import SignUpPage from '../src/pages/SignUpPage';
import '@testing-library/jest-dom';

// Mock ReCAPTCHA
jest.mock('react-google-recaptcha', () => (props) => (
  <div data-testid="recaptcha" onClick={() => props.onChange('test-token')}>
    ReCAPTCHA
  </div>
));

// Mock the Header and Footer components since we're not testing them here
jest.mock('../src/components/Header', () => () => <div>Mock Header</div>);
jest.mock('../src/components/Footer', () => () => <div>Mock Footer</div>);

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ role: 'user' }),
  })
);

const renderWithRouter = (component) => {
  return render(<Router>{component}</Router>);
};

describe('SignUpPage', () => {
  beforeEach(() => {
    fetch.mockClear();
    jest.clearAllMocks();
  });

  test('renders form elements', () => {
    renderWithRouter(<SignUpPage />);

    expect(screen.getByLabelText(/First Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mobile Number:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Birth:/i)).toBeInTheDocument();
    expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument(); // Updated
  });

  test('handles form submission successfully', async () => {
    renderWithRouter(<SignUpPage />);

    fireEvent.change(screen.getByLabelText(/First Name:/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name:/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number:/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/Date of Birth:/i), { target: { value: '2000-01-01' } });

    fireEvent.click(screen.getByTestId('recaptcha')); // Simulate ReCAPTCHA

    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i })); // Updated

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          mobileNumber: '1234567890',
          dateOfBirth: '2000-01-01',
          captchaToken: 'test-token',
        }),
      });
    });
  });

  test('handles form submission error', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Error creating user' }),
      })
    );

    renderWithRouter(<SignUpPage />);

    fireEvent.change(screen.getByLabelText(/First Name:/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name:/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number:/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/Date of Birth:/i), { target: { value: '2000-01-01' } });

    fireEvent.click(screen.getByTestId('recaptcha'));

    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i })); // Updated

    await waitFor(() => {
      expect(screen.getByText(/Error creating user/i)).toBeInTheDocument();
    });
  });
});
