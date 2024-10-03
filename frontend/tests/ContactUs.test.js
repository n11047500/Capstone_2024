import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ContactUs from '../src/pages/ContactUs';
import '@testing-library/jest-dom'; // For better assertions
import { CartContext } from '../src/context/CartContext';
import { MemoryRouter } from 'react-router-dom';

// Mock the ReCAPTCHA component
jest.mock('react-google-recaptcha', () => {
  return ({ onChange }) => (
    <div>
      <button onClick={() => onChange('mocked-token')}>Mocked reCAPTCHA</button>
    </div>
  );
});

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
  })
);

// Create a mock CartContext provider
const mockCartContextValue = {
  cart: [],
  // You can add other values/methods you might need from CartContext here
};

const MockCartProvider = ({ children }) => (
  <CartContext.Provider value={mockCartContextValue}>
    {children}
  </CartContext.Provider>
);

describe('ContactUs Component', () => {
  beforeEach(() => {
    fetch.mockClear(); // Clear previous fetch calls
  });

  test('renders ContactUs component', () => {
    render(
      <MemoryRouter> {/* Wrap with MemoryRouter */}
        <MockCartProvider>
          <ContactUs />
        </MockCartProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /Contact Us/i })).toBeInTheDocument();
  });

  test('submits the form successfully', async () => {
    render(
      <MemoryRouter> {/* Wrap with MemoryRouter */}
        <MockCartProvider>
          <ContactUs />
        </MockCartProvider>
      </MemoryRouter>
    );

    // Fill in the form fields
    fireEvent.change(screen.getByPlaceholderText(/Your First Name.../i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Your Last Name.../i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Your Email.../i), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/optional/i), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Write your inquiry here.../i), {
      target: { value: 'This is a test inquiry.' },
    });

    // Click on the mocked reCAPTCHA button
    fireEvent.click(screen.getByText(/Mocked reCAPTCHA/i));

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Submit Form/i }));

    // Wait for the success message to appear
    expect(await screen.findByText(/Your inquiry has been sent successfully!/i)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1); // Ensure fetch was called
  });

  test('shows error message when CAPTCHA is not completed', async () => {
    render(
      <MemoryRouter> {/* Wrap with MemoryRouter */}
        <MockCartProvider>
          <ContactUs />
        </MockCartProvider>
      </MemoryRouter>
    );

     // Fill in required fields but do not complete CAPTCHA
    fireEvent.change(screen.getByLabelText(/First Name:/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name:/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/Enquiry:/i), { target: { value: 'Question about products.' } });

    // Click the submit button without completing CAPTCHA
    fireEvent.click(screen.getByRole('button', { name: /Submit Form/i }));

    // Expect an error message for CAPTCHA
    expect(await screen.findByText(/Please complete the CAPTCHA./i)).toBeInTheDocument();
});

  test('handles fetch error', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
      })
    );

    render(
      <MemoryRouter> {/* Wrap with MemoryRouter */}
        <MockCartProvider>
          <ContactUs />
        </MockCartProvider>
      </MemoryRouter>
    );

    // Fill in the form fields
    fireEvent.change(screen.getByPlaceholderText(/Your First Name.../i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Your Last Name.../i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Your Email.../i), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/optional/i), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Write your inquiry here.../i), {
      target: { value: 'This is a test inquiry.' },
    });

    // Click on the mocked reCAPTCHA button
    fireEvent.click(screen.getByText(/Mocked reCAPTCHA/i));

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Submit Form/i }));

    // Check for the error message
    expect(await screen.findByText(/Failed to send your inquiry. Please try again./i)).toBeInTheDocument();
  });
});