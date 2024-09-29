import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ProductPage from './ProductPage';
import { CartContext } from '../context/CartContext'; // Ensure this path is correct
import { BrowserRouter as Router } from 'react-router-dom';
import { useParams } from 'react-router-dom';

// Mock useParams to return a specific productId
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}));

describe('ProductPage Integration Tests', () => {
    const mockAddToCart = jest.fn(); // Mock addToCart function

    const renderWithContext = () => {
        return render(
            <Router>
                <CartContext.Provider value={{ addToCart: mockAddToCart, cart: [] }}> {/* Add cart with default value */}
                    <ProductPage />
                </CartContext.Provider>
            </Router>
        );
    };

    beforeEach(() => {
        // Mocking useParams to provide a productId
        useParams.mockImplementation(() => ({ productId: '1' }));

        // Mock the fetch API to return a product
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    Product_Name: 'Test Product',
                    Description: 'This is a dummy product',
                    Product_Price: 100,
                    Product_Dimensions: '10x10x10',
                    Product_Options: 'Option 1,Option 2',
                    averageRating: 4.5,
                    reviewCount: 10,
                }),
            })
        );
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear mock calls after each test
    });



    test('displays product details after fetch', async () => {
        renderWithContext();
    
        // Wait for the product details to be displayed
        const titles = await screen.findAllByText(/Test Product/i);
        expect(titles).toHaveLength(1); // Expect only one instance to be present
        expect(titles[0]).toBeInTheDocument(); // Ensure the first one is in the document
    
        expect(screen.getByText(/This is a dummy product/i)).toBeInTheDocument();
        expect(screen.getByText(/\$100/i)).toBeInTheDocument();
    
        // Use a more flexible matcher for dimensions
        const dimensionsText = screen.getByText(/Dimensions:/i);
        expect(dimensionsText).toBeInTheDocument(); // Check for "Dimensions:" separately
    
        // Now check if the full content matches
        expect(dimensionsText).toHaveTextContent("Dimensions:"); // Check the part before the dimensions
        expect(screen.getByText(/10x10x10/i)).toBeInTheDocument(); // Check for the dimensions separately
    
        expect(screen.getByText(/4.50/i)).toBeInTheDocument();
        expect(screen.getByText(/10 reviews/i)).toBeInTheDocument();
    });

    test('adds product to cart', async () => {
        // Mock the fetch API to return a product
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    Product_Name: 'Test Product',
                    Product_Options: 'Option 1,Option 2',
                }),
            })
        );

        renderWithContext();

        // Wait for the product details to be displayed
        await screen.findByText(/Test Product/i);

        const addToCartButton = screen.getByText(/Add to Cart/i);
        
        // Select an option if available
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Option 1' } });
        
        // Change quantity to 2
        fireEvent.change(screen.getByLabelText(/Quantity:/i), { target: { value: '2' } });

        fireEvent.click(addToCartButton);

        expect(mockAddToCart).toHaveBeenCalledWith(
            expect.objectContaining({ Product_Name: 'Test Product', selectedOption: 'Option 1' }),
            2
        ); // Check if addToCart was called with the correct product and quantity
    });

    test('alerts user when no option is selected', async () => {
        // Mock the fetch API to return a product
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    Product_Name: 'Test Product',
                    Product_Options: 'Option 1,Option 2',
                }),
            })
        );

        renderWithContext();

        await screen.findByText(/Test Product/i);

        const addToCartButton = screen.getByText(/Add to Cart/i);
        
        // Mock alert
        window.alert = jest.fn();

        fireEvent.click(addToCartButton);

        expect(window.alert).toHaveBeenCalledWith('Please select an option');
    });
});
