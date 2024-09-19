import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactUs from './ContactUs';
import { CartContext } from '../context/CartContext';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';

// Mocking the ReCAPTCHA component
jest.mock('react-google-recaptcha', () => ({ onChange }) => (
  <button onClick={() => onChange('mock-token')}>Mock ReCAPTCHA</button>
));

// Mocking the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
  })
);

describe('ContactUs Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders ContactUs form correctly', async () => {
    const mockCartContextValue = { cart: [] };

    render(
      <MemoryRouter>
        <CartContext.Provider value={mockCartContextValue}>
          <ContactUs />
        </CartContext.Provider>
      </MemoryRouter>
    );

    // Wait for form elements to be present in the document
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Your First Name.../i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Your Last Name.../i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Your Email.../i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Write your inquiry here.../i)).toBeInTheDocument();
    });
  });

  test('handles form submission correctly', async () => {
    const mockCartContextValue = { cart: [] };

    render(
      <MemoryRouter>
        <CartContext.Provider value={mockCartContextValue}>
          <ContactUs />
        </CartContext.Provider>
      </MemoryRouter>
    );

    // Fill out the form fields
    userEvent.type(screen.getByPlaceholderText(/Your First Name.../i), 'John');
    userEvent.type(screen.getByPlaceholderText(/Your Last Name.../i), 'Doe');
    userEvent.type(screen.getByPlaceholderText(/Your Email.../i), 'john.doe@example.com');
    userEvent.type(screen.getByPlaceholderText(/Write your inquiry here.../i), 'This is a test inquiry.');

    // Simulate CAPTCHA click
    userEvent.click(screen.getByText(/Mock ReCAPTCHA/i));

    // Submit the form
    await act(async () => {
      userEvent.click(screen.getByRole('button', { name: /Submit Form/i }));
    });

    // Wait for fetch to be called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/send-contact-email`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            mobile: '',
            inquiry: 'This is a test inquiry.',
            captchaToken: 'mock-token',
          }),
        })
      );
    });
  });
});

