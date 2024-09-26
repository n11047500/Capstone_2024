import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactUs from './ContactUs';
import { BrowserRouter as Router } from 'react-router-dom';
import { CartProvider } from '../context/CartContext'; // Adjust the import path as necessary

// Mocking the reCAPTCHA component
jest.mock('react-google-recaptcha', () => {
  return function DummyReCAPTCHA({ onChange }) {
    return <button onClick={() => onChange('mockToken')}>Verify CAPTCHA</button>;
  };
});

// Utility function to render with Router and CartProvider
const renderWithProviders = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <CartProvider>
      <Router>{ui}</Router>
    </CartProvider>
  );
};

describe('ContactUs Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  test('Should display error message when CAPTCHA is not completed', async () => {
    renderWithProviders(<ContactUs />);

    // Fill out the form without completing reCAPTCHA
    fireEvent.change(screen.getByLabelText(/First Name:/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name:/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number:/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/Enquiry:/i), { target: { value: 'Inquiry text' } });

    const submitButton = screen.getByRole('button', { name: /Submit Form/i });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText(/Please complete the CAPTCHA./i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('Should display success message on successful form submission', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(),
      })
    );

    renderWithProviders(<ContactUs />);

    // Fill out the form and complete reCAPTCHA
    fireEvent.change(screen.getByLabelText(/First Name:/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name:/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number:/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/Enquiry:/i), { target: { value: 'Inquiry text' } });

    // Trigger reCAPTCHA
    fireEvent.click(screen.getByText(/Verify CAPTCHA/i));

    const submitButton = screen.getByRole('button', { name: /Submit Form/i });
    fireEvent.click(submitButton);

    const successMessage = await screen.findByText(/Your inquiry has been sent successfully!/i);
    expect(successMessage).toBeInTheDocument();
  });

  test('Should display error message on failed form submission', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve(),
      })
    );

    renderWithProviders(<ContactUs />);

    // Fill out the form and complete reCAPTCHA
    fireEvent.change(screen.getByLabelText(/First Name:/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name:/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number:/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/Enquiry:/i), { target: { value: 'Inquiry text' } });

    // Trigger reCAPTCHA
    fireEvent.click(screen.getByText(/Verify CAPTCHA/i));

    const submitButton = screen.getByRole('button', { name: /Submit Form/i });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText(/Failed to send your inquiry. Please try again./i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('Should handle network errors gracefully', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network Error')));

    renderWithProviders(<ContactUs />);

    // Fill out the form and complete reCAPTCHA
    fireEvent.change(screen.getByLabelText(/First Name:/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name:/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number:/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/Enquiry:/i), { target: { value: 'Inquiry text' } });

    // Trigger reCAPTCHA
    fireEvent.click(screen.getByText(/Verify CAPTCHA/i));

    const submitButton = screen.getByRole('button', { name: /Submit Form/i });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText(/An error occurred. Please try again later./i);
    expect(errorMessage).toBeInTheDocument();
  });
});
