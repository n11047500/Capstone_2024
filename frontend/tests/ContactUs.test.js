import { render, screen, fireEvent } from '@testing-library/react';
import ContactUs from '../src/pages/ContactUs';
import React from 'react';

const mockFetch = jest.fn();

beforeAll(() => {
  global.fetch = mockFetch; // Mock the fetch API
});

afterEach(() => {
  jest.clearAllMocks(); // Clear mocks after each test
});

// Mock the Header and Footer components since we're not testing them here
jest.mock('../src/components/Header', () => () => <div>Mock Header</div>);
jest.mock('../src/components/Footer', () => () => <div>Mock Footer</div>);

describe('ContactUs Component', () => {
  test('renders the ContactUs component', () => {
    render(<ContactUs />);
    expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
    expect(screen.getByText(/We'd love to hear all general enquiries/i)).toBeInTheDocument();
  });

  test('captures user input correctly', () => {
    render(<ContactUs />);

    // Use placeholders to target specific inputs
    const firstNameInput = screen.getByPlaceholderText(/Your First Name/i);
    const lastNameInput = screen.getByPlaceholderText(/Your Last Name/i);
    const emailInput = screen.getByPlaceholderText(/Your Email/i);
    const phoneInput = screen.getByPlaceholderText(/Phone \(optional\)/i);
    const inquiryInput = screen.getByPlaceholderText(/Write your inquiry here/i);

    // Simulate user input for each field
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.change(inquiryInput, { target: { value: 'I have a question.' } });

    // Assert that each field has the correct value
    expect(firstNameInput).toHaveValue('John');
    expect(lastNameInput).toHaveValue('Doe');
    expect(emailInput).toHaveValue('john.doe@example.com');
    expect(phoneInput).toHaveValue('1234567890');
    expect(inquiryInput).toHaveValue('I have a question.');
  });

  test('shows message if CAPTCHA is not completed', async () => {
    render(<ContactUs />);

    // Fill out the form completely
    fireEvent.change(screen.getByPlaceholderText(/Your First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/Your Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Your Email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Phone \(optional\)/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText(/Write your inquiry here/i), { target: { value: 'I have a question.' } });

    // Attempt to submit the form without completing the CAPTCHA
    fireEvent.click(screen.getByText(/Submit Form/i));

    // Check for the message
    expect(await screen.findByText((content) => content.includes('Please complete the CAPTCHA.'))).toBeInTheDocument();
  });

  test('submits form successfully and shows success message', async () => {
    // Mock the fetch response to simulate a successful form submission
    mockFetch.mockResolvedValueOnce({ ok: true });

    // Mock CAPTCHA handler
    const mockCaptchaHandler = jest.fn();
    const { rerender } = render(<ContactUs handleCaptcha={mockCaptchaHandler} />);

    // Fill out the form fields
    fireEvent.change(screen.getByPlaceholderText(/Your First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/Your Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Your Email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Phone \(optional\)/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText(/Write your inquiry here/i), { target: { value: 'I have a question.' } });

    // Simulate CAPTCHA completion
    const captchaToken = 'captcha-token';
    mockCaptchaHandler(captchaToken);

    // Submit the form
  fireEvent.click(screen.getByText(/Submit Form/i));

  // Expect success message to be displayed
  expect(await screen.findByText(/Your inquiry has been sent successfully/i)).toBeInTheDocument();
});


  test('shows error message on submission failure', async () => {
    // Mock the fetch response to simulate a successful form submission
    mockFetch.mockResolvedValueOnce({ ok: false });

    // Mock CAPTCHA handler
    const mockCaptchaHandler = jest.fn();
    const { rerender } = render(<ContactUs handleCaptcha={mockCaptchaHandler} />);

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/Your First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/Your Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Your Email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Phone \(optional\)/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText(/Write your inquiry here/i), { target: { value: 'I have a question.' } });

    // Simulate CAPTCHA completion
    const captchaToken = 'captcha-token';
    mockCaptchaHandler(captchaToken);

    // Submit the form
    fireEvent.click(screen.getByText(/Submit Form/i));

    // Use a function matcher to check for the error message, even if it's split across multiple elements
    expect(await screen.findByText((content, element) => content.includes('Failed to send your inquiry') && content.includes('Please try again.'))).toBeInTheDocument();
  });
  
  test('shows error message on network error', async () => {
    render(<ContactUs />);
    
    // Fill in the form fields
    fireEvent.change(screen.getByPlaceholderText(/Your First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/Your Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Your Email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Phone \(optional\)/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText(/Write your inquiry here/i), { target: { value: 'I have a question.' } });

    // Simulate CAPTCHA completion
    fireEvent.change(screen.getByTestId('captcha-input'), { target: { value: 'captcha-token' } });

    // Mock a network error response
    global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
    );

    // Submit the form
    fireEvent.click(screen.getByText(/Submit Form/i));

    // Check for the error message
    expect(await screen.findByText(/Error: Failed to send your inquiry/i)).toBeInTheDocument();
});

});
