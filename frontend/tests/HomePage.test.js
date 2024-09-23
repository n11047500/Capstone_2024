import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../src/pages/HomePage';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock server to handle API requests
const server = setupServer(
    rest.get(`${process.env.REACT_APP_API_URL}/products`, (req, res, ctx) => {
        return res(
            ctx.json([
                {
                    Product_ID: 1,
                    Product_Name: 'Product 1',
                    Product_Price: 10.0,
                    Product_Image_URL: 'http://example.com/product1.jpg',
                },
                {
                    Product_ID: 2,
                    Product_Name: 'Product 2',
                    Product_Price: 20.0,
                    Product_Image_URL: 'http://example.com/product2.jpg',
                },
            ])
        );
    })
);

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset any request handlers that are declared as a part of our tests
afterEach(() => server.resetHandlers());

// Disable API mocking after the tests are done
afterAll(() => server.close());

test('renders HomePage with products', async () => {
    render(<HomePage />);

    // Check if the header is rendered
    expect(screen.getByText(/Featured Products/i)).toBeInTheDocument();

    // Wait for the products to be fetched and displayed
    await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('$10.00')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
        expect(screen.getByText('$20.00')).toBeInTheDocument(); 
    });
});

test('renders correct number of products based on window size', async () => {
    // Mock window.innerWidth
    global.innerWidth = 800;
    global.dispatchEvent(new Event('resize')); // Trigger resize event

    render(<HomePage />);

    // Wait for the products to be fetched and displayed
    await waitFor(() => {
        const productCards = screen.getAllByRole('article'); // Assuming ProductCard renders an <article>
        expect(productCards.length).toBe(6); // Adjust as per your logic based on width 800
    });

    // Optionally, you can test different sizes here by changing window.innerWidth
});
