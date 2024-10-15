import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ForgotPassword from '../src/pages/ForgotPassword'; // Adjust the import as necessary
import fetchMock from 'jest-fetch-mock'; // Mock fetch for testing
import { CartContext } from '../src/context/CartContext'; // Adjust the import based on your folder structure
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter

// Enable fetch mocking
fetchMock.enableMocks();

// Mocking the ReCAPTCHA component
jest.mock('react-google-recaptcha', () => {
    return jest.fn(({ onChange }) => (
        <div data-testid="recaptcha-mock" onClick={() => onChange('captcha-token')} />
    ));
});

// Mock cart context provider
const MockCartProvider = ({ children }) => {
    const cart = []; // Provide an empty cart or default values
    return (
        <CartContext.Provider value={{ cart }}>
            {children}
        </CartContext.Provider>
    );
};

describe('ForgotPassword Component', () => {
    beforeEach(() => {
        fetch.resetMocks();
        jest.clearAllMocks(); // Clear mock calls before each test
    });

    test('renders Forgot Password form', () => {
        render(
            <MockCartProvider>
                <BrowserRouter>
                    <ForgotPassword />
                </BrowserRouter>
            </MockCartProvider>
        );
        expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Enter your Email/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
    });

    test('shows error message when reCAPTCHA is not completed', async () => {
        render(
            <MockCartProvider>
                <BrowserRouter>
                    <ForgotPassword />
                </BrowserRouter>
            </MockCartProvider>
        );

        fireEvent.change(screen.getByLabelText(/Enter your Email/i), { target: { value: 'test@example.com' } });

        fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));

        expect(await screen.findByText(/Please complete the CAPTCHA./i)).toBeInTheDocument();
    });

    test('sends reset link when form is submitted with valid email and CAPTCHA', async () => {
        const mockResponse = { message: 'Reset link sent to your email.' };
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        render(
            <MockCartProvider>
                <BrowserRouter>
                    <ForgotPassword />
                </BrowserRouter>
            </MockCartProvider>
        );

        // Simulate user filling in the email field
        fireEvent.change(screen.getByLabelText(/enter your email/i), { target: { value: 'test@example.com' } });

        // Simulate completing reCAPTCHA by clicking on the mock
        fireEvent.click(screen.getByTestId('recaptcha-mock'));

        // Simulate form submission
        fireEvent.click(screen.getByText(/send reset link/i));

        // Wait for the success message to appear
        expect(await screen.findByText(mockResponse.message)).toBeInTheDocument();

        // Verify that fetch was called with the correct parameters
        expect(mockFetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', captchaToken: 'captcha-token' }),
        });

        // Clean up the mock
        mockFetch.mockRestore();
    });

    test('displays message when CAPTCHA is not completed', async () => {
        render(
            <MockCartProvider>
                <BrowserRouter>
                    <ForgotPassword />
                </BrowserRouter>
            </MockCartProvider>
        );

        // Simulate user filling in the email field
        fireEvent.change(screen.getByLabelText(/enter your email/i), { target: { value: 'test@example.com' } });

        // Simulate form submission without completing CAPTCHA
        fireEvent.click(screen.getByText(/send reset link/i));

        // Check for the message indicating CAPTCHA completion is required
        expect(await screen.findByText('Please complete the CAPTCHA.')).toBeInTheDocument();
    });

    test('shows error message on API failure', async () => {
        // Mocking the fetch function to simulate an API failure
        const mockFetch = jest.spyOn(global, 'fetch').mockRejectedValue(new Error('API failure'));

        render(
            <MockCartProvider>
                <BrowserRouter>
                    <ForgotPassword />
                </BrowserRouter>
            </MockCartProvider>
        );

        // Simulate user filling in the email field
        fireEvent.change(screen.getByLabelText(/enter your email/i), { target: { value: 'test@example.com' } });

        // Simulate completing reCAPTCHA by clicking on the mock
        fireEvent.click(screen.getByTestId('recaptcha-mock'));

        // Simulate form submission
        fireEvent.click(screen.getByText(/send reset link/i));

        // Wait for the error message to appear
        expect(await screen.findByText('Error sending reset link.')).toBeInTheDocument();

        // Clean up the mock
        mockFetch.mockRestore();
    });
});
