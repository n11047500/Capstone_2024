import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import LoginPage from '../src/pages/LoginPage';
import { CartProvider } from '../src/context/CartContext'; // Ensure the correct import path

// Mock the navigate function
jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

// Mock ReCAPTCHA component
jest.mock('react-google-recaptcha', () => {
    return function MockReCAPTCHA({ onChange }) {
        return <button onClick={() => onChange('mock-captcha-token')}>Mock CAPTCHA</button>;
    };
});

// Mock Header and Footer components
jest.mock('../src/components/Header', () => () => <header>Mock Header</header>);
jest.mock('../src/components/Footer', () => () => <footer>Mock Footer</footer>);

describe('LoginPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Wrap LoginPage in CartProvider for each test
    const renderWithProviders = (ui) => {
        return render(<CartProvider>{ui}</CartProvider>);
    };

    test('renders LoginPage correctly', () => {
        renderWithProviders(<LoginPage />);

        // Check for the heading separately
        expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();

        // Check for the email and password fields
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();

        // Check for the login button
        expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();

        // Check for mock header and footer
        expect(screen.getByText(/Mock Header/i)).toBeInTheDocument();
        expect(screen.getByText(/Mock Footer/i)).toBeInTheDocument();
    });

    test('displays an error when CAPTCHA is not completed', async () => {
        renderWithProviders(<LoginPage />);

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        expect(await screen.findByText(/Please complete the CAPTCHA./i)).toBeInTheDocument();
    });

    test('sends login request with valid credentials and CAPTCHA', async () => {
        // Mock the fetch function
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ email: 'test@example.com', role: 'user' }),
            })
        );

        renderWithProviders(<LoginPage />);

        // Complete the CAPTCHA
        fireEvent.click(screen.getByRole('button', { name: /Mock CAPTCHA/i }));

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test@example.com', password: 'password123', captchaToken: 'mock-captcha-token' }),
            });
        });
    });

    test('displays an error message on API failure', async () => {
        // Mock the fetch function to simulate an API failure
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ message: 'Invalid credentials' }),
            })
        );

        renderWithProviders(<LoginPage />);

        // Complete the CAPTCHA
        fireEvent.click(screen.getByRole('button', { name: /Mock CAPTCHA/i }));

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpassword' } });

        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
    });

    test('displays a generic error message on network failure', async () => {
        // Mock the fetch function to simulate a network error
        global.fetch = jest.fn(() => Promise.reject(new Error('Network Error')));

        renderWithProviders(<LoginPage />);

        // Complete the CAPTCHA
        fireEvent.click(screen.getByRole('button', { name: /Mock CAPTCHA/i }));

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        expect(await screen.findByText(/An error occurred. Please try again./i)).toBeInTheDocument();
    });
});
