import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPassword from '../src/pages/ForgotPassword'; // Adjust the import as necessary
import fetchMock from 'jest-fetch-mock'; // Mock fetch for testing
import { CartContext } from '../src/context/CartContext'; // Adjust the import based on your folder structure
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter

// Enable fetch mocking
fetchMock.enableMocks();

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
        render(
            <MockCartProvider>
                <BrowserRouter>
                    <ForgotPassword />
                </BrowserRouter>
            </MockCartProvider>
        );

        const captchaToken = 'test-captcha-token';
        const email = 'test@example.com';
    
        // Set the email input
        fireEvent.change(screen.getByLabelText(/Enter your Email/i), { target: { value: email } });
    
        // Set the captcha token (this should be properly simulated in your component)
        fireEvent.change(screen.getByRole('textbox'), { target: { value: captchaToken } }); // Adjust this if your captcha input is different
    
        // Mock the API response
        fetch.mockResponseOnce(JSON.stringify({ message: 'Reset link sent to your email!' }));
    
        // Click the submit button
        fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));
    
        // Verify the fetch call
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, captchaToken }),
            });
        });
    
        // Verify success message
        expect(await screen.findByText(/Reset link sent to your email!/i)).toBeInTheDocument();
    });

    test('shows error message on API failure', async () => {
        render(
            <MockCartProvider>
                <BrowserRouter>
                    <ForgotPassword />
                </BrowserRouter>
            </MockCartProvider>
        );

        // Simulate completing reCAPTCHA
        const captchaToken = 'test-captcha-token';
        const email = 'test@example.com';

        fireEvent.change(screen.getByLabelText(/Enter your Email/i), { target: { value: email } });

        // Manually trigger the captcha handling
        fireEvent.change(screen.getByRole('textbox'), { target: { value: captchaToken } }); // Simulate token change

        // Mock the API response to simulate error
        fetch.mockRejectOnce(new Error('API is down')); // Ensure fetch is mocked to reject

        fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));

        // Wait for the error message to appear
        await waitFor(() => {
            expect(screen.getByText(/Error sending reset link./i)).toBeInTheDocument();
        });
    });
});
