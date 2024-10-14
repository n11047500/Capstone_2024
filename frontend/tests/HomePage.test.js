import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../src/pages/HomePage';

// Mock the Header, ProductCard, Footer, and Slideshow components
jest.mock('../src/components/Header', () => () => <div>Header</div>);
jest.mock('../src/components/ProductCard', () => (props) => <div data-testid="product-card">{props.title}</div>);
jest.mock('../src/components/Footer', () => () => <div>Footer</div>);
jest.mock('../src/components/Slideshow', () => () => <div>Slideshow</div>);

// Mock the global fetch function
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('HomePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous mocks
  });

  test('renders the HomePage with Header, Slideshow, and Footer', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Slideshow')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  test('displays error message when fetch fails', async () => {
    // Mock fetch to simulate a failed response
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<HomePage />);

    expect(await screen.findByText(/failed to load products/i)).toBeInTheDocument();
  });

  test('fetches and displays products successfully', async () => {
    // Mock fetch to return a successful response with product data
    const mockProducts = [
      { Product_ID: '1', Product_Name: 'Product 1', Product_Price: '10.00', Product_Image_URL: 'url1' },
      { Product_ID: '2', Product_Name: 'Product 2', Product_Price: '20.00', Product_Image_URL: 'url2' },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    render(<HomePage />);

    await waitFor(() => expect(screen.getAllByTestId('product-card')).toHaveLength(mockProducts.length));

    // Check if product names are displayed
    mockProducts.forEach(product => {
      expect(screen.getByText(product.Product_Name)).toBeInTheDocument();
    });
  });

test('updates displayed products on window resize', async () => {
    // Mock fetch to return a successful response with product data
    const mockProducts = [
        { Product_ID: '1', Product_Name: 'Product 1', Product_Price: '10.00', Product_Image_URL: 'url1' },
        { Product_ID: '2', Product_Name: 'Product 2', Product_Price: '20.00', Product_Image_URL: 'url2' },
        { Product_ID: '3', Product_Name: 'Product 3', Product_Price: '30.00', Product_Image_URL: 'url3' },
        { Product_ID: '4', Product_Name: 'Product 4', Product_Price: '40.00', Product_Image_URL: 'url4' },
        { Product_ID: '5', Product_Name: 'Product 5', Product_Price: '50.00', Product_Image_URL: 'url5' },
        { Product_ID: '6', Product_Name: 'Product 6', Product_Price: '60.00', Product_Image_URL: 'url6' },
        { Product_ID: '7', Product_Name: 'Product 7', Product_Price: '70.00', Product_Image_URL: 'url7' },
        { Product_ID: '8', Product_Name: 'Product 8', Product_Price: '80.00', Product_Image_URL: 'url8' },
    ];

    // Mock the fetch call to return product data
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockProducts),
        })
    );

    render(<HomePage />);

    // Simulate window resize to a width that should show 6 products
    global.innerWidth = 800;
    window.dispatchEvent(new Event('resize'));

    await waitFor(() => expect(screen.getAllByTestId('product-card')).toHaveLength(6));

    // Simulate window resize to a width that should show 3 products
    global.innerWidth = 500;
    window.dispatchEvent(new Event('resize'));

    // Wait for the products to be updated after resize
    await waitFor(() => expect(screen.getAllByTestId('product-card')).toHaveLength(3));
});

});
