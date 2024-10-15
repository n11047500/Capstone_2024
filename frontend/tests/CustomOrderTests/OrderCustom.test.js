import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ConfirmationPage from '../../src/pages/CustomOrder/orderCustom';
import { CartContext } from '../../src/context/CartContext';

// Create a mock CartContext provider
const MockCartProvider = ({ children }) => {
    const mockCart = [
        { id: 1, name: 'Item 1', quantity: 2 }, // Example item with a quantity
        { id: 2, name: 'Item 2', quantity: 1 },
    ]; // Define your mock cart as an array of items

    return (
        <CartContext.Provider value={{ cart: mockCart }}>
            {children}
        </CartContext.Provider>
    );
};

describe('ConfirmationPage', () => {
    test('renders the confirmation message', () => {
        // Mocking the location state
        const mockLocation = {
            state: {
                // You can add any necessary data here
            },
        };

        render(
            <MemoryRouter initialEntries={[{ pathname: '/confirmation', state: mockLocation.state }]}>
                <MockCartProvider>
                    <Routes>
                        <Route path="/confirmation" element={<ConfirmationPage />} />
                    </Routes>
                </MockCartProvider>
            </MemoryRouter>
        );

        // Assertions to check if the confirmation message is rendered
        expect(screen.getByText(/Thank You for submitting your form!/i)).toBeInTheDocument();
        expect(screen.getByText(/Your customized order has been sent to Ezee Planter/i)).toBeInTheDocument();
    });

    test('renders the Header and Footer components', () => {
        const mockLocation = {
            state: {},
        };

        render(
            <MemoryRouter initialEntries={[{ pathname: '/confirmation', state: mockLocation.state }]}>
                <MockCartProvider>
                    <Routes>
                        <Route path="/confirmation" element={<ConfirmationPage />} />
                    </Routes>
                </MockCartProvider>
            </MemoryRouter>
        );

        // Check if Header and Footer are rendered
        expect(screen.getByRole('banner')).toBeInTheDocument(); // Assuming Header has a role of banner
        expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Assuming Footer has a role of contentinfo
    });
});