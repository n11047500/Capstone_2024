import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../src/pages/HomePage';
import { CartProvider } from '../src/context/CartContext';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Create an instance of MockAdapter
const mock = new MockAdapter(axios);

beforeEach(() => {
    mock.reset(); // Reset any existing mocks before each test
});

test('renders HomePage with header, slideshow, and footer', async () => {
    // Mock the API response for the products endpoint
    const apiUrl = process.env.REACT_APP_API_URL;
    if (!apiUrl) {
        throw new Error('REACT_APP_API_URL is not set');
    }

    mock.onGet(`${apiUrl}/products`).reply(200, [
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
    ]);

    render(
        <MemoryRouter>
            <CartProvider>
                <HomePage />
            </CartProvider>
        </MemoryRouter>
    );

    // Check if the header and other components are rendered
    expect(screen.getByText(/Featured Products/i)).toBeInTheDocument();

    // Wait for the products to be fetched and displayed
    expect(await screen.findByText(/Product 1/i)).toBeInTheDocument();
    expect(await screen.findByText(/\$10.00/i)).toBeInTheDocument();
    expect(await screen.findByText(/Product 2/i)).toBeInTheDocument();
    expect(await screen.findByText(/\$20.00/i)).toBeInTheDocument();
});

test('renders correct number of products based on window size', async () => {
    // Mock the API response for the products endpoint
    mock.onGet(`${process.env.REACT_APP_API_URL}/products`).reply(200, [
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
        {
            Product_ID: 3,
            Product_Name: 'Product 3',
            Product_Price: 15.0,
            Product_Image_URL: 'http://example.com/product3.jpg',
        },
        {
            Product_ID: 4,
            Product_Name: 'Product 4',
            Product_Price: 25.0,
            Product_Image_URL: 'http://example.com/product4.jpg',
        },
        {
            Product_ID: 5,
            Product_Name: 'Product 5',
            Product_Price: 30.0,
            Product_Image_URL: 'http://example.com/product5.jpg',
        },
        {
            Product_ID: 6,
            Product_Name: 'Product 6',
            Product_Price: 35.0,
            Product_Image_URL: 'http://example.com/product6.jpg',
        },
    ]);

    // Set window size for the test
    global.innerWidth = 800; // Example width
    global.dispatchEvent(new Event('resize')); // Trigger resize event

    render(
        <MemoryRouter>
            <CartProvider>
                <HomePage />
            </CartProvider>
        </MemoryRouter>
    );

    // Wait for the products to be fetched and displayed
    await waitFor(() => {
        const productCards = screen.getAllByRole('article'); // Assuming ProductCard renders an <article>
        expect(productCards.length).toBe(6); // Adjust based on your logic
    });
});

test('updates product count on window resize', async () => {
    // Mock the API response for the products endpoint
    mock.onGet(`${process.env.REACT_APP_API_URL}/products`).reply(200, [
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
        {
            Product_ID: 3,
            Product_Name: 'Product 3',
            Product_Price: 15.0,
            Product_Image_URL: 'http://example.com/product3.jpg',
        },
        {
            Product_ID: 4,
            Product_Name: 'Product 4',
            Product_Price: 25.0,
            Product_Image_URL: 'http://example.com/product4.jpg',
        },
        {
            Product_ID: 5,
            Product_Name: 'Product 5',
            Product_Price: 30.0,
            Product_Image_URL: 'http://example.com/product5.jpg',
        },
        {
            Product_ID: 6,
            Product_Name: 'Product 6',
            Product_Price: 35.0,
            Product_Image_URL: 'http://example.com/product6.jpg',
        },
    ]);

    render(
        <MemoryRouter>
            <CartProvider>
                <HomePage />
            </CartProvider>
        </MemoryRouter>
    );


    // Initial check
    await waitFor(() => {
        expect(screen.getAllByRole('article').length).toBe(10); // For example, on larger screens
    });

    // Set smaller window size
    global.innerWidth = 500; // Simulate smaller screen
    global.dispatchEvent(new Event('resize')); // Trigger resize event

    // Check updated product count
    await waitFor(() => {
        expect(screen.getAllByRole('article').length).toBe(3); // Adjust based on your logic
    });
});
