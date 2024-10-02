import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartContext } from '../../src/context/CartContext';
import CheckoutPage from '../../src/pages/Checkout/CheckoutPage';

const mockCart = [
    {
        Product_ID: '1',
        Product_Name: 'Test Product 1',
        Product_Price: 100,
        quantity: 2,
        Product_Image_URL: 'http://example.com/image1.jpg',
    },
    {
        Product_ID: '2',
        Product_Name: 'Test Product 2',
        Product_Price: 50,
        quantity: 1,
        Product_Image_URL: 'http://example.com/image2.jpg',
    },
];

const renderCheckoutPageWithContext = (cart) => {
    return render(
        <MemoryRouter> {/* Wrap with MemoryRouter */}
            <CartContext.Provider value={{ cart }}>
                <CheckoutPage />
            </CartContext.Provider>
        </MemoryRouter>
    );
};

describe('CheckoutPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders checkout page with steps', () => {
        renderCheckoutPageWithContext(mockCart);

        // Check for the active step
        expect(screen.getByRole('heading', { name: /Personal Information/i })).toBeInTheDocument();

        // Check for the steps
        expect(screen.getByText(/Shipping Method/i)).toBeInTheDocument();
        expect(screen.getByText(/Payment Method/i)).toBeInTheDocument();
        expect(screen.getByText('Summary')).toBeInTheDocument();
    });

    test('calculates total correctly', () => {
        renderCheckoutPageWithContext(mockCart);

        const totalAmount = 100 * 2 + 50 * 1; // (100 * 2) + (50 * 1) = 250
        expect(screen.getByText(/Total/i)).toBeInTheDocument();
        expect(screen.getByText(`$${totalAmount}.00`)).toBeInTheDocument(); // Assuming currency format is AUD
    });

    test('navigates through the steps', async () => {
        renderCheckoutPageWithContext(mockCart);

        // Check initial step
        expect(screen.getByRole('heading', { name: /Personal Information/i })).toBeVisible();

        // Move to Shipping Method
        const nextButton = await screen.findByRole('button', { name: /continue to shipping/i });
        fireEvent.click(nextButton); // Simulate clicking the next button
        expect(screen.getByRole('heading', { name: /shipping method/i })).toBeVisible();

        // Move to Payment Method
        const nextButtonAgain = screen.getByRole('button', { name: /next/i }); // Use "Next" instead of "continue to payment"
        fireEvent.click(nextButtonAgain); // Simulate clicking the next button again
        const paymentMethodHeading = await screen.findByRole('heading', { name: /payment method/i });
        expect(paymentMethodHeading).toBeVisible();

        // Move back to Shipping Method
        const backButton = screen.getByRole('button', { name: /back/i }); // Ensure this matches the actual back button text
        fireEvent.click(backButton); // Simulate clicking the back button
        expect(screen.getByRole('heading', { name: /Shipping Method/i })).toBeVisible();
    });
});